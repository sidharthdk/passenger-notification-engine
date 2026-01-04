// @ts-nocheck
// @ts-nocheck
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase keys. Ensure .env has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const REAL_FLIGHTS = [
    { flight_number: 'AA100', route: 'JFK -> LHR' },  // American Airlines
    { flight_number: 'BA175', route: 'LHR -> JFK' },  // British Airways
    { flight_number: 'SQ24', route: 'SIN -> JFK' },  // Singapore Airlines
    { flight_number: 'EK201', route: 'DXB -> JFK' },  // Emirates
    { flight_number: 'QF1', route: 'SYD -> LHR' },  // Qantas
    { flight_number: 'DL1', route: 'JFK -> LHR' },  // Delta
];

async function seed() {
    console.log('🌱 Seeding database with REAL flight numbers...');

    // Optional: Clear old "test" flights (those usually have "TEST" or "CANCEL" in name)
    // We won't delete everything to preserve history, but let's add these new ones.

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const f of REAL_FLIGHTS) {
        // Check if exists
        const { data: existing } = await supabase
            .from('flights')
            .select('id')
            .eq('flight_number', f.flight_number)
            .maybeSingle();

        if (!existing) {
            const { error } = await supabase.from('flights').insert({
                flight_number: f.flight_number,
                status: 'ON_TIME', // Default, will be updated by Sync API
                delay_minutes: 0,
                departure_time: tomorrow.toISOString(), // Placeholder, API might correct this or we use it as base
                arrival_time: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000).toISOString()
            });

            if (error) console.error(`❌ Failed to add ${f.flight_number}:`, error.message);
            else console.log(`✅ Added ${f.flight_number} (${f.route})`);
        } else {
            console.log(`ℹ️ ${f.flight_number} already exists.`);
        }
    }

    console.log('\n✨ Database seeded. Now go to the dashboard and click "Check Live Status" to fetch real data!');
}

seed().catch(console.error);
