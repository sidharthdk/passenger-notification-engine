// @ts-nocheck
require('dotenv').config();
import { GET } from '@/app/api/sync-flights/route';
import { supabase } from '../lib/supabase';

async function verify() {
    console.log('✈️ Starting Aviation Integration Verification...');

    // 1. Create a dummy flight for testing (if not exists)
    // Use a known flight number that Aviationstack might have, or random.
    // 'AA100' (American Airlines JFK->LHR) is usually daily.
    const testFlightNum = 'AA100';
    console.log(`Checking/Creating test flight ${testFlightNum}...`);

    const { data: existing } = await supabase
        .from('flights')
        .select('id')
        .eq('flight_number', testFlightNum)
        .single();

    if (!existing) {
        await supabase.from('flights').insert({
            flight_number: testFlightNum,
            departure_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            arrival_time: new Date(Date.now() + 90000000).toISOString(),
            status: 'ON_TIME',
            delay_minutes: 0
        });
        console.log('✅ Created test flight.');
    } else {
        console.log('ℹ️ Test flight exists.');
    }

    // 2. Call Sync API in Simulation Mode
    console.log('\n🔄 Invoking Sync API (Simulation Mode)...');

    // Mock Request
    const req = new Request('http://localhost/api/sync-flights?simulate=true');
    const res = await GET(req);
    const data = await res.json();

    console.log('📊 API Response:', JSON.stringify(data, null, 2));

    if (data.simulated !== true) {
        console.error('❌ Error: Response.simulated should be true.');
    } else {
        console.log('✅ Simulation flag respected.');
    }

    if (data.updates && data.updates.length > 0) {
        console.log(`✅ Processed ${data.processed} flights.`);
        const update = data.updates.find((u: any) => u.flight === testFlightNum);
        if (update) {
            console.log(`✅ Found update for ${testFlightNum}:`, update);
            if (update.mcp) {
                console.log('🧠 MCP Decision:', update.mcp.decision);
                console.log('🛡️ MCP Risk Score:', update.mcp.risk_score);
            } else {
                console.warn('⚠️ MCP data missing in update.');
            }
        } else {
            console.warn(`⚠️ No update found for ${testFlightNum}. Maybe API key invalid or flight not found?`);
        }
    } else {
        console.warn('⚠️ No updates returned. DB empty or API failure?');
    }
}

verify().catch(console.error);
