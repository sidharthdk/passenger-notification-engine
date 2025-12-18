import dotenv from 'dotenv';
import path from 'path';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 2. Import dependencies after env is loaded
// Note: using .ts extensions for ts-node ESM execution
import { supabase } from '../lib/supabase.ts';
import { processFlightUpdate } from '../lib/rulesEngine.ts';
import { Flight } from '../types/index.ts';

async function main() {
    console.log('🚀 Starting Notification Flow Test...');

    const runId = Math.floor(Math.random() * 10000);
    const testEmail = process.env.SMTP_USER || 'test@example.com'; // Use authenticated email if possible

    console.log(`📧 using email: ${testEmail}`);

    try {
        // --- A. Setup Helper Data ---
        // 1. Create Passenger
        const { data: passenger, error: pError } = await supabase
            .from('passengers')
            .insert([{
                name: `Test Passenger ${runId}`,
                email: testEmail,
                phone_number: '+1234567890',
                preferred_language: 'en'
            }])
            .select()
            .single();

        if (pError) throw new Error(`Passenger creation failed: ${pError.message}`);
        console.log(`✅ Created Passenger: ${passenger.id}`);

        // 2. Create Flight (On Time)
        const { data: flight, error: fError } = await supabase
            .from('flights')
            .insert([{
                flight_number: `TEST-${runId}`,
                departure_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                arrival_time: new Date(Date.now() + 90000000).toISOString(),
                status: 'ON_TIME',
                delay_minutes: 0
            }])
            .select()
            .single();

        if (fError) throw new Error(`Flight creation failed: ${fError.message}`);
        console.log(`✅ Created Flight: ${flight.id}`);

        // 3. Create Booking
        const { data: booking, error: bError } = await supabase
            .from('bookings')
            .insert([{
                flight_id: flight.id,
                passenger_id: passenger.id,
                seat_number: '1A',
                status: 'CONFIRMED'
            }])
            .select()
            .single();

        if (bError) throw new Error(`Booking creation failed: ${bError.message}`);
        console.log(`✅ Created Booking: ${booking.id}`);


        // --- B. Trigger Logic ---
        console.log('⚡ Triggering Flight Delay (0 -> 45 mins)...');

        const oldFlight = { ...flight };
        const newFlight: Flight = {
            ...flight,
            status: 'DELAYED',
            delay_minutes: 45
        };

        // Call the rules engine directly
        await processFlightUpdate(oldFlight, newFlight);


        // --- C. Verify ---
        console.log('🔍 Checking Notification Logs...');
        // Give it a moment (async logs)
        await new Promise(r => setTimeout(r, 2000));

        const { data: logs, error: lError } = await supabase
            .from('notification_logs')
            .select('*')
            .eq('booking_id', booking.id);

        if (lError) throw lError;

        if (logs && logs.length > 0) {
            console.log(`✅ SUCCESS: Found ${logs.length} notification logs!`);
            logs.forEach(l => console.log(`   - [${l.channel}] Status: ${l.status}`));
        } else {
            console.error('❌ FAILURE: No notification logs found.');
            process.exit(1);
        }

    } catch (err: any) {
        console.error('❌ Test Failed:', err.message);
        process.exit(1);
    }
}

main();
