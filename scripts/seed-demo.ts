import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
    console.log('Seeding data...');

    // Create Flight
    const { data: flight, error: fErr } = await supabase.from('flights').insert({
        flight_number: 'DEMO-' + Math.floor(Math.random() * 1000),
        departure_time: new Date().toISOString(),
        arrival_time: new Date(Date.now() + 7200000).toISOString(),
        status: 'ON_TIME',
        delay_minutes: 0
    }).select().single();

    if (fErr) { console.error('Flight Fail:', fErr); return; }

    // Create Passenger
    const { data: passenger, error: pErr } = await supabase.from('passengers').insert({
        name: 'Demo User',
        email: 'demo@example.com',
        preferred_language: 'en'
    }).select().single();

    if (pErr) { console.error('Passenger Fail:', pErr); return; }

    // Create Booking
    const { data: booking, error: bErr } = await supabase.from('bookings').insert({
        flight_id: flight.id,
        passenger_id: passenger.id
    }).select().single();

    if (bErr) { console.error('Booking Fail:', bErr); return; }

    console.log('\n==================================================');
    console.log('✅ DEMO DATA CREATED');
    console.log('--------------------------------------------------');
    console.log(`Visit this URL to see the status page:\n`);
    console.log(`http://localhost:3000/status/${booking.id}`);
    console.log('==================================================\n');
}

main().catch(console.error);
