import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { aviationStack, AviationStackFlight } from '@/lib/aviationstack';
import { processFlightUpdate } from '@/lib/rulesEngine';
import { Flight, FlightStatus } from '@/types';

// Helper to map AviationStack status to internal status
function mapStatus(avStatus: string): FlightStatus {
    switch (avStatus) {
        case 'cancelled':
        case 'diverted': // Treat diverted as cancelled/critical for now? Or keep as DELAYED? User requirment says "Diversion -> Escalate to CRITICAL". 
            // But FlightStatus enum is limited. Let's map to CANCELLED for high alert or DELAYED.
            // Actually "Diversion / Cancellation Detection ... Escalate to CRITICAL". 
            // For now, let's map diversion to DELAYED but high delay? 
            // Or simplest: 'active' -> 'ON_TIME' (if no delay), 'scheduled' -> 'ON_TIME'.
            return 'CANCELLED';
        case 'active':
        case 'scheduled':
        case 'landed':
            return 'ON_TIME'; // Delay will be handled by delay_minutes check
        case 'incident':
            return 'DELAYED';
        default:
            return 'ON_TIME';
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const simulate = searchParams.get('simulate') === 'true';

    console.log(`[Sync] Starting flight sync. Simulation: ${simulate}`);

    // 1. Fetch active flights (e.g., departures in next 24h)
    // For MVP/Demo, let's just fetch ALL flights for simplicity or flights that are not 'arrived' (but we don't have that status).
    // Just fetch all for now.
    const { data: flights, error } = await supabase.from('flights').select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updates = [];

    for (const flight of flights) {
        // 2. Fetch from AviationStack
        const avFlight = await aviationStack.getFlightStatus(flight.flight_number); // Requires IATA e.g. "AA123"

        if (!avFlight) {
            console.warn(`[Sync] No data found for ${flight.flight_number}`);
            continue;
        }

        // 3. Map Data
        // Calculate delay. AviationStack gives 'departure.delay' in minutes.
        const delayMinutes = avFlight.departure.delay || 0;

        // Determine Status
        // If delay > 15, mark as DELAYED (if not cancelled)
        let newStatus = mapStatus(avFlight.flight_status);
        if (newStatus !== 'CANCELLED' && delayMinutes >= 15) {
            newStatus = 'DELAYED';
        }

        const newFlightData: Flight = {
            ...flight,
            status: newStatus,
            delay_minutes: delayMinutes,
            gate: avFlight.departure.gate,
            terminal: avFlight.departure.terminal,
            // Keep original times? Or update them? 
            // "actual" times vs "scheduled". Database has 'departure_time'. 
            // Ideally we stick to scheduled? Or update to estimated?
            // Let's keep departure_time as "Scheduled" for reference or update to "Estimated"? 
            // Usually DB has Scheduled. Let's keep existing but update status/delay.
        };

        // 4. Process Logic (Rules Engine)
        const decision = await processFlightUpdate(flight, newFlightData, simulate);

        // 5. Update DB (Skip in simulation?)
        // Requirement: "Simulation mode... DO NOT send alerts... DO NOT write logs". 
        // Does it mean DO NOT update DB? 
        // "Fetch.. Run MCP.. Show severity.. DO NOT send alerts.. DO NOT write logs".
        // Usually simulation shouldn't mutate DB state either, but catching "changes" relies on stored state.
        // For "Alert Engine", simulation usually means "Simulate what WOULD happen given current external data".
        // To be safe, if simulate=true, we definitely do NOT update the DB.

        if (!simulate) {
            // Check if updates are needed to avoid DB spam
            const needsUpdate =
                flight.status !== newStatus ||
                flight.delay_minutes !== delayMinutes ||
                flight.gate !== newFlightData.gate ||
                flight.terminal !== newFlightData.terminal;

            if (needsUpdate) {
                await supabase
                    .from('flights')
                    .update({
                        status: newStatus,
                        delay_minutes: delayMinutes,
                        gate: newFlightData.gate,
                        terminal: newFlightData.terminal
                    })
                    .eq('id', flight.id);

                updates.push({
                    flight: flight.flight_number,
                    status: 'UPDATED',
                    changes: { newStatus, delayMinutes },
                    mcp: decision
                });
            }
        } else {
            updates.push({
                flight: flight.flight_number,
                status: 'SIMULATED',
                changes: { newStatus, delayMinutes },
                mcp: decision
            });
        }
    }

    return NextResponse.json({
        success: true,
        simulated: simulate,
        processed: flights.length,
        updates
    });
}
