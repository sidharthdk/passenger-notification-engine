import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    console.log('--- raw db fix (PNR Update) ---');
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('No DATABASE_URL found.');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Needed for Supabase usually
    });

    try {
        await client.connect();
        console.log('Connected to DB.');

        // 1. Add PNR column if not exists
        await client.query(`
            ALTER TABLE public.bookings 
            ADD COLUMN IF NOT EXISTS pnr TEXT UNIQUE;
        `);
        console.log('Axis PNR column check passed.');

        // 2. Cleanup old PNR data to allow clean insert
        try {
            await client.query(`DELETE FROM public.bookings WHERE pnr = 'SIA-101';`);
            // We don't delete the passenger to avoid cascading issues if validation fails, 
            // but for this test we can try to find them first.
        } catch (e) { console.log('Cleanup skipped'); }

        // 3. Ensure Flight Exists
        let fRes = await client.query(`SELECT id FROM public.flights WHERE flight_number = 'SIA-101' LIMIT 1;`);
        let flightId;
        if (fRes.rows.length === 0) {
            fRes = await client.query(`
                INSERT INTO public.flights (flight_number, departure_time, arrival_time, status)
                VALUES ('SIA-101', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 4 hours', 'ON_TIME')
                RETURNING id;
            `);
            flightId = fRes.rows[0].id;
        } else {
            flightId = fRes.rows[0].id;
        }

        // 4. Ensure Passenger Exists
        let pRes = await client.query(`SELECT id FROM public.passengers WHERE email = 'test@sia.com' LIMIT 1;`);
        let passengerId;
        if (pRes.rows.length === 0) {
            pRes = await client.query(`
                INSERT INTO public.passengers (name, email, preferred_language)
                VALUES ($1, $2, $3)
                RETURNING id;
            `, ['Jane Doe', 'test@sia.com', 'en']);
            passengerId = pRes.rows[0].id;
        } else {
            passengerId = pRes.rows[0].id;
        }

        // 5. Create Booking with PNR
        await client.query(`
            INSERT INTO public.bookings (flight_id, passenger_id, seat_number, status, pnr, ticket_price, passenger_status)
            VALUES ($1, $2, '12A', 'CONFIRMED', 'SIA-101', 450.00, 'ON_TIME');
        `, [flightId, passengerId]);

        console.log(`✅ SEEDED Booking: PNR=SIA-101 / Name=Doe (PassengerID: ${passengerId})`);

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await client.end();
    }
}

main();
