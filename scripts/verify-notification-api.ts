import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log('🚀 Starting API Notification Test...');
    const runId = Math.floor(Math.random() * 10000);
    const testEmail = process.env.SMTP_USER || 'test-verifier@example.com';

    try {
        // A. Setup Data (Direct DB Access)
        console.log('Creating Test Data...');

        // 1. Passenger
        const { data: passenger, error: pError } = await supabase
            .from('passengers')
            .insert([{
                name: `API Test User ${runId}`,
                email: testEmail,
                phone_number: '555-0199',
                preferred_language: 'en'
            }])
            .select()
            .single();
        if (pError) throw new Error(`Passenger error: ${pError.message}`);

        // 2. Flight
        const { data: flight, error: fError } = await supabase
            .from('flights')
            .insert([{
                flight_number: `API-FLIGHT-${runId}`,
                departure_time: new Date(Date.now() + 86400000).toISOString(),
                arrival_time: new Date(Date.now() + 90000000).toISOString(),
                status: 'ON_TIME',
                delay_minutes: 0
            }])
            .select()
            .single();
        if (fError) throw new Error(`Flight error: ${fError.message}`);

        // 3. Booking
        const { data: booking, error: bError } = await supabase
            .from('bookings')
            .insert([{
                flight_id: flight.id,
                passenger_id: passenger.id,
                seat_number: '10F'
            }])
            .select()
            .single();
        if (bError) throw new Error(`Booking error: ${bError.message}`);

        console.log(`✅ Setup Complete. Flight: ${flight.flight_number}, Booking: ${booking.id}`);


        // B. Trigger via API (Simulate Admin Action)
        console.log('⚡ Calling API to Delay Flight...');

        const response = await fetch('http://localhost:3000/api/flights', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: flight.id,
                status: 'DELAYED',
                delay_minutes: 45
            })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API Call Failed: ${response.status} ${text}`);
        }

        const json = await response.json();
        console.log('API Response:', JSON.stringify(json, null, 2));


        // C. Verify Notification Log
        console.log('🔍 Verifying Notification Logs...');
        await new Promise(r => setTimeout(r, 3000)); // Wait for async processing

        const { data: logs, error: lError } = await supabase
            .from('notification_logs')
            .select('*')
            .eq('booking_id', booking.id);

        if (lError) throw lError;

        if (logs && logs.length > 0) {
            console.log(`✅ SUCCESS: Found ${logs.length} logs!`);
            logs.forEach(l => {
                console.log(`   - Channel: ${l.channel} | Status: ${l.status}`);
                if (l.channel === 'EMAIL' && l.status === 'SENT') {
                    console.log('   (Email sent successfully via Nodemailer)');
                }
            });
        } else {
            console.error('❌ FAILURE: No logs found. Notification system issue.');
            process.exit(1);
        }

    } catch (err: any) {
        console.error('❌ Test Failed:', err.message);
        process.exit(1);
    }
}

main();
