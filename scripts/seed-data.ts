import dotenv from 'dotenv';
import path from 'path';

// Load Environment Variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { supabase } from '../lib/supabase';

async function main() {
    console.log('🌱 Seeding Data...');

    const now = new Date();
    const flights = [
        {
            flight_number: 'SA-101',
            departure_time: new Date(now.getTime() + 3600000).toISOString(), // +1h
            arrival_time: new Date(now.getTime() + 7200000).toISOString(),
            status: 'ON_TIME',
            delay_minutes: 0
        },
        {
            flight_number: 'SA-202',
            departure_time: new Date(now.getTime() + 18000000).toISOString(), // +5h
            arrival_time: new Date(now.getTime() + 21600000).toISOString(), // +6h
            status: 'DELAYED',
            delay_minutes: 45
        },
        {
            flight_number: 'SA-999',
            departure_time: new Date(now.getTime() + 86400000).toISOString(), // +24h
            arrival_time: new Date(now.getTime() + 90000000).toISOString(),
            status: 'CANCELLED',
            delay_minutes: 0
        }
    ];

    for (const f of flights) {
        const { error } = await supabase.from('flights').insert(f);
        if (error) {
            console.error(`Failed to insert ${f.flight_number}:`, error.message);
        } else {
            console.log(`✅  Inserted ${f.flight_number}`);
        }
    }

    console.log('Done.');
}

main();
