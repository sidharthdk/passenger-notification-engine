import 'dotenv/config';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const SCHEMA_FILE = path.join(process.cwd(), 'schema.sql');

async function main() {
    console.log('🔄 Attempting to apply schema changes...');

    // Common local Supabase ports
    const ports = [54322, 5432, 6543];
    let client: Client | null = null;
    let connected = false;

    // Try connection string from env first, if exists
    const envUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (envUrl) {
        console.log(`Checking env DATABASE_URL...`);
        try {
            client = new Client({ connectionString: envUrl });
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
            const connectionString = `postgresql://postgres:postgres@localhost:${port}/postgres`;
            console.log(`Trying ${connectionString}...`);
            try {
                client = new Client({ connectionString });
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
        console.error('❌ Could not connect to local PostgreSQL. Please modify the schema manually by running the SQL in schema.sql.');
        process.exit(1);
    }

    try {
        const sql = fs.readFileSync(SCHEMA_FILE, 'utf-8');
        // Simple split by semicolon might fail on complex functions, but for CREATE TABLE it's usually fine.
        // Or just run the whole blob? pg driver supports valid Multi-statement.

        // However, schema.sql has "Run this in your..." comments which are fine in SQL.
        // It also has "IF NOT EXISTS" so it's safe to re-run.

        console.log('Running SQL...');
        await client.query(sql);
        console.log('✅ Schema successfully updated!');
    } catch (e) {
        console.error('❌ Schema application failed:', e);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
