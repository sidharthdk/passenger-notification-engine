import 'dotenv/config';
import { supabase } from '../lib/supabase'; // ts-node often resolves without .ts if configured, but let's try standard.
// Actually, if it's ESM, it needs full path OR we run with specific flags.
// Let's try relying on standard ts-node behavior but checking cwd.
import { processFlightUpdate } from '../lib/rulesEngine';
import { processPendingJobs } from '../lib/queue';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log('🛡️ STARTING SAFETY VERIFICATION...');

    // 1. Setup Test Data
    const flightId = uuidv4();
    const flightNumber = 'SAFETY-TEST-001';

    // Create Mock Flight in DB manually to ensure FK constraints
    const { data: flight, error: fErr } = await supabase.from('flights').insert({
        id: flightId,
        flight_number: flightNumber,
        departure_time: new Date().toISOString(),
        arrival_time: new Date().toISOString(),
        status: 'ON_TIME',
        delay_minutes: 0
    }).select().single();

    if (fErr) {
        console.error('❌ Failed to create test flight:', fErr);
        // If table missing, this is where we crash and know.
        return;
    }
    console.log(`✅ Test Flight Created: ${flightNumber}`);

    // Create Mock Passenger & Booking
    const { data: booking } = await supabase.from('bookings').insert({
        flight_id: flightId,
        passenger_id: (await supabase.from('passengers').insert({ name: 'Safety Tester' }).select().single()).data.id
    }).select().single();

    // 2. Trigger DELAY (Should Enqueue)
    console.log('\n--- TEST 1: Triggering Initial Delay ---');
    await processFlightUpdate(
        { ...flight, status: 'ON_TIME', delay_minutes: 0 },
        { ...flight, status: 'DELAYED', delay_minutes: 45 },
        false // Not simulation
    );

    // allow async queue to insert
    await new Promise(r => setTimeout(r, 2000));

    // Verify Job Exists
    const { data: jobs } = await supabase.from('notification_jobs')
        .select('*')
        .eq('flight_id', flightId);

    if (jobs && jobs.length > 0) {
        console.log(`✅ Job Enqueued! Count: ${jobs.length}`);
        console.log(`   Status: ${jobs[0].status}`);
    } else {
        console.error('❌ NO Job Enqueued!');
    }

    // 3. Process Job (Simulate Worker)
    console.log('\n--- TEST 2: Processing Jobs ---');
    await processPendingJobs();

    const { data: processedJobs } = await supabase.from('notification_jobs')
        .select('*')
        .eq('flight_id', flightId);

    if (processedJobs?.[0].status === 'SENT') {
        console.log('✅ Job Successfully Processed (SENT).');
    } else {
        console.error(`❌ Job Processing Failed. Status: ${processedJobs?.[0].status}`);
    }

    // 4. Trigger SAME Delay Immediately (Cooldown Check)
    console.log('\n--- TEST 3: Cooldown Verification ---');
    await processFlightUpdate(
        { ...flight, status: 'ON_TIME', delay_minutes: 0 },
        { ...flight, status: 'DELAYED', delay_minutes: 45 },
        false
    );

    // Check count - should still be same
    const { count } = await supabase.from('notification_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('flight_id', flightId);

    console.log(`Total Jobs: ${count} (Expected: Same as before)`);
    if (count === jobs?.length) {
        console.log('✅ Cooldown Worked! No new job created.');
    } else {
        console.error('❌ Cooldown FAILED! New job created.');
    }

    // Cleanup
    // await supabase.from('flights').delete().eq('id', flightId);
}

main().catch(console.error);
