import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { processFlightUpdate } from '@/lib/rulesEngine';
import { Flight } from '@/types';

// POST: Create a new flight
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { flight_number, departure_time, arrival_time } = body;

        // Validate required fields
        if (!flight_number || !departure_time || !arrival_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('flights')
            .insert([
                {
                    flight_number,
                    departure_time,
                    arrival_time,
                    status: 'ON_TIME',
                    delay_minutes: 0,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ data }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update flight status or delay
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status, delay_minutes } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing flight ID' }, { status: 400 });
        }

        // 1. Fetch current flight data (for rules engine comparison)
        const { data: oldFlight, error: fetchError } = await supabase
            .from('flights')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !oldFlight) {
            return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
        }

        // 2. Prepare update object
        const updateData: Partial<Flight> = {};
        if (status !== undefined) updateData.status = status;
        if (delay_minutes !== undefined) updateData.delay_minutes = delay_minutes;

        // 3. Update flight in DB
        const { data: newFlight, error: updateError } = await supabase
            .from('flights')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        // 4. Trigger Rules Engine
        // We pass both old and new flight data to determine if a notification is needed
        console.log('[API] Flight Update:', {
            id,
            oldStatus: oldFlight.status,
            newStatus: newFlight.status,
            oldDelay: oldFlight.delay_minutes,
            newDelay: newFlight.delay_minutes
        });
        await processFlightUpdate(oldFlight as Flight, newFlight as Flight);

        return NextResponse.json({ data: newFlight });
    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
