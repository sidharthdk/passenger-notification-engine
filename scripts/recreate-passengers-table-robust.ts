import 'dotenv/config';
import { Client } from 'pg';

async function main() {
    console.log('🔄 Fixing Passengers Table (Robust Mode)...');

    const ports = [54322, 5432, 6543];
    let client: Client | null = null;
    let connected = false;

    // 1. Try ENV
    const envUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (envUrl) {
        console.log(`Checking env DATABASE_URL...`);
        try {
            // Short timeout to not hang on DNS
            client = new Client({ connectionString: envUrl, connectionTimeoutMillis: 5000 });
            await client.connect();
            console.log(`✅ Connected via environment variable!`);
            connected = true;
        } catch (e) {
            console.warn(`Connection failed via env: ${(e as Error).message}`);
            client = null;
        }
    }

    // 2. Try Local Ports
    if (!connected) {
        for (const port of ports) {
            const connectionString = `postgresql://postgres:postgres@localhost:${port}/postgres`;
            console.log(`Trying ${connectionString}...`);
            try {
                client = new Client({ connectionString });
                await client.connect();
                console.log(`✅ Connected on port ${port}!`);
                connected = true;
                break;
            } catch (e) {
                // Ignore
            }
        }
    }

    if (!connected || !client) {
        console.error('❌ Could not connect to any DB. Cannot fix table.');
        process.exit(1);
    }

    try {
        // 3. Drop & Recreate
        await client.query('DROP TABLE IF EXISTS public.passengers CASCADE;');
        console.log('Dropped passengers table.');

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

        // 4. Seed User
        // Generate a fixed email so we can tell the user.
        const email = 'test@sia.com';
        const password = 'password123';

        await client.query(`
            INSERT INTO public.passengers (name, email, password)
            VALUES ($1, $2, $3)
        `, ['Test Passenger', email, password]);

        console.log(`✅ SEEDED SUCCESSFULLY`);
        console.log(`EMAIL: ${email}`);
        console.log(`PASSWORD: ${password}`);

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await client.end();
    }
}

main();
