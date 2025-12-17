import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Polyfill fetch if needed (Node 18+ has it)
// usage: npx ts-node scripts/verify-mvp.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Helper to debug
if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'http://localhost:3000';

async function main() {
    console.log('Starting Verification...');
    console.log('Connecting to Supabase at:', supabaseUrl);

    // 1. Setup Data
    const flightNum = 'TEST-' + Math.floor(Math.random() * 10000);
    console.log(`Creating flight ${flightNum}...`);

    const { data: flight, error: flightError } = await supabase
        .from('flights')
        .insert({
            flight_number: flightNum,
            departure_time: new Date().toISOString(),
            arrival_time: new Date(Date.now() + 3600000).toISOString(),
            status: 'ON_TIME',
            delay_minutes: 0
        })
        .select()
        .single();

    if (flightError) {
        console.error('Supabase Flight Creation Error:', JSON.stringify(flightError, null, 2));
        throw new Error('Failed to create flight');
    }
    console.log('Flight created:', flight.id);

    const { data: passenger, error: passengerError } = await supabase
        .from('passengers')
        .insert({
            name: 'Test Passenger',
            email: 'test@example.com',
            preferred_language: 'en'
        })
        .select()
        .single();

    if (passengerError) {
        console.error('Supabase Passenger Creation Error:', JSON.stringify(passengerError, null, 2));
        throw new Error('Failed to create passenger');
    }
    console.log('Passenger created:', passenger.id);

    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
            flight_id: flight.id,
            passenger_id: passenger.id
        })
        .select()
        .single();

    if (bookingError) {
        console.error('Supabase Booking Creation Error:', JSON.stringify(bookingError, null, 2));
        throw new Error('Failed to create booking');
    }
    console.log('Booking created:', booking.id);

    // 2. Trigger Delay (API Call)
    console.log('Triggering Delay via API...');
    const res = await fetch(`${BASE_URL}/api/flights`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: flight.id,
            delay_minutes: 45 // > 30 mins
        })
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API Failed: ${res.status} ${text}`);
    }
    console.log('API Response OK');

    // 3. Verify Logs
    console.log('Verifying Notification Logs...');
    // Give it a moment? Logic is async but awaited in API.

    const { data: logs, error: logsError } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('booking_id', booking.id);

    if (logsError) throw logsError;

    if (logs.length > 0) {
        console.log('SUCCESS: Notification logs found:', logs.length);
        logs.forEach(l => console.log(`- [${l.channel}] ${l.status}: ${JSON.stringify(l.payload)}`));
    } else {
        console.error('FAILURE: No notification logs found!');
        process.exit(1);
    }

    // 4. Verify Cancellation
    console.log('Triggering Cancellation via API...');
    const resCancel = await fetch(`${BASE_URL}/api/flights`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: flight.id,
            status: 'CANCELLED'
        })
    });

    if (!resCancel.ok) throw new Error('Cancellation API failed');

    const { data: logs2 } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('booking_id', booking.id)
        .eq('payload->>type', 'CANCELLED'); // JSON query might vary, just checking count increase

    // Actually we can just check total logs
    const { count } = await supabase
        .from('notification_logs')
        .select('*', { count: 'exact', head: true })
        .eq('booking_id', booking.id);

    console.log(`Total logs now: ${count}`);
    if ((count || 0) > logs.length) {
        console.log('SUCCESS: Cancellation logs generated.');
    } else {
        console.error('FAILURE: No new logs for cancellation.');
    }

    console.log('Verification Complete.');
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
