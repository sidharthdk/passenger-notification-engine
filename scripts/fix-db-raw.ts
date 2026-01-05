import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    console.log('--- raw db fix ---');
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

        // 1. Drop old table
        await client.query('DROP TABLE IF EXISTS public.passengers CASCADE;');
        console.log('Dropped passengers table.');

        // 2. Recreate Table
        await client.query(`
            CREATE TABLE public.passengers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                email TEXT,
                phone_number TEXT,
                preferred_language TEXT DEFAULT 'en',
                password TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('Recreated passengers table.');

        // 3. Seed User
        const email = 'test@sia.com';
        const password = 'password123';

        await client.query(`
            INSERT INTO public.passengers (name, email, password)
            VALUES ($1, $2, $3)
        `, ['Test Passenger', email, password]);

        console.log(`✅ SEEDED: ${email} / ${password}`);

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await client.end();
    }
}

main();
