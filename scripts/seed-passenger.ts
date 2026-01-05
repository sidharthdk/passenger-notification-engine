import 'dotenv/config';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Test Script to seed data for Passenger Verification
async function main() {
    console.log('--- Seeding Passenger Data ---');

    // 1. Create Passenger
    const passengerId = uuidv4();
    const email = `test_passenger_${Date.now()}@example.com`;
    const password = 'password123';

    const { error: pErr } = await supabase.from('passengers').insert({
        id: passengerId,
        name: 'John Doe',
        email: email,
        password: password
    });

    if (pErr) console.error('Error creating passenger:', pErr);
    else console.log(`✅ Passenger created: ${email} / ${password} (ID: ${passengerId})`);

    // 2. Create Flight
    const flightId = uuidv4();
    const { error: fErr } = await supabase.from('flights').insert({
        id: flightId,
        flight_number: 'SIA-999',
        departure_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        arrival_time: new Date(Date.now() + 90000000).toISOString(),
        status: 'ON_TIME',
        delay_minutes: 0
    });

    if (fErr && !fErr.message.includes('duplicate')) console.error('Error creating flight:', fErr);
    else console.log('✅ Flight SIA-999 seed ready.');

    // 3. Create Booking
    const { error: bErr } = await supabase.from('bookings').insert({
        flight_id: flightId,
        passenger_id: passengerId,
        seat_number: '12A',
        ticket_price: 500,
        fare_class: 'ECONOMY',
        passenger_status: 'ON_TIME'
    });

    if (bErr) console.error('Error creating booking:', bErr);
    else console.log('✅ Booking created ($500 Economy).');

    console.log('\n--- Setup Complete ---');
    console.log('You can now log in at /passenger/login with the credentials above.');
}

main();
