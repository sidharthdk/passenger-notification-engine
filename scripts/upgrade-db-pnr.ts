import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    console.log('--- DB Upgrade: Add PNR ---');
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    // Common local Supabase ports
    const ports = [54322, 5432, 6543];
    let client: Client | null = null;
    let connected = false;

    // Try connection string from env first
    if (connectionString) {
        console.log(`Checking env DATABASE_URL...`);
        try {
            client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
            await client.connect();
            console.log(`✅ Connected via environment variable!`);
            connected = true;
        } catch (e) {
            console.warn(`Connection failed via env: ${(e as Error).message}`);
            client = null;
        }
    }

    if (!connected) {
        for (const port of ports) {
            const localString = `postgresql://postgres:postgres@localhost:${port}/postgres`;
            console.log(`Trying ${localString}...`);
            try {
                client = new Client({ connectionString: localString });
                await client.connect();
                console.log(`✅ Connected on port ${port}!`);
                connected = true;
                break;
            } catch (e) {
                // Ignore failure and try next
            }
        }
    }

    if (!connected || !client) {
        console.error('❌ Could not connect to local PostgreSQL.');
        process.exit(1);
    }

    try {
        // 1. Add PNR column if not exists
        await client.query(`
            ALTER TABLE public.bookings 
            ADD COLUMN IF NOT EXISTS pnr TEXT UNIQUE;
        `);
        console.log('Axis PNR column check passed.');

        // 2. Ensure we have a clean slate for the test passenger/booking
        //    (Optional: Cleans up old test data to avoid duplicates)
        try {
            await client.query(`DELETE FROM public.bookings WHERE pnr = 'SIA-101';`);
            await client.query(`DELETE FROM public.passengers WHERE email = 'test@sia.com';`);
        } catch (ignore) {
            // Tables might not exist or foreign key issues
        }

        // 3. Create Test Passenger
        const pRes = await client.query(`
            INSERT INTO public.passengers (name, email, preferred_language)
            VALUES ($1, $2, $3)
            RETURNING id;
        `, ['Jane Doe', 'test@sia.com', 'en']);
        const passengerId = pRes.rows[0].id;
        console.log('Created Test Passenger:', passengerId);

        // 4. Create Flight (if needed, or just look one up)
        //    For simplicity, let's just make sure there's ONE flight
        let fRes = await client.query(`SELECT id FROM public.flights LIMIT 1;`);
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

        // 5. Create Booking with PNR
        await client.query(`
            INSERT INTO public.bookings (flight_id, passenger_id, seat_number, status, pnr, ticket_price, passenger_status)
            VALUES ($1, $2, '12A', 'CONFIRMED', 'SIA-101', 450.00, 'ON_TIME');
        `, [flightId, passengerId]);

        console.log(`✅ SEEDED Booking: PNR=SIA-101 / Name=Doe`);

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await client.end();
    }
}

main();
