import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!connectionString) {
        console.error('No DATABASE_URL found.');
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('--- Passengers ---');
        const resPass = await client.query('SELECT id, name FROM public.passengers');
        console.table(resPass.rows);

        console.log('--- Flights ---');
        const resFlights = await client.query('SELECT id, flight_number FROM public.flights');
        console.table(resFlights.rows);

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await client.end();
    }
}

main();
