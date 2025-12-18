import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, language } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
        }

        // 1. Create Passenger
        const { data: passenger, error: pErr } = await supabase
            .from('passengers')
            .insert({
                name,
                email,
                phone_number: phone || null,
                preferred_language: language || 'en',
            })
            .select()
            .single();

        if (pErr) throw pErr;

        // 2. Auto-generate a random flight for them
        const randomFlightNum = 'AUTO-' + Math.floor(Math.random() * 9000 + 1000);
        // Departure in 2-5 hours
        const depTime = new Date(Date.now() + Math.random() * 10000000 + 7200000);
        const arrTime = new Date(depTime.getTime() + 7200000); // 2 hour flight

        const { data: flight, error: fErr } = await supabase
            .from('flights')
            .insert({
                flight_number: randomFlightNum,
                departure_time: depTime.toISOString(),
                arrival_time: arrTime.toISOString(),
                status: 'ON_TIME',
            })
            .select()
            .single();

        if (fErr) throw fErr;

        // 3. Create Booking
        const { data: booking, error: bErr } = await supabase
            .from('bookings')
            .insert({
                flight_id: flight.id,
                passenger_id: passenger.id,
                seat_number: '1A', // VIP treatment
            })
            .select()
            .single();

        if (bErr) throw bErr;

        // Return the redirect URL
        return NextResponse.json({
            success: true,
            redirectUrl: `/status/${booking.id}`
        });

    } catch (error: any) {
        console.error('Signup Error:', error);
        return NextResponse.json({ error: error.message || 'Signup failed' }, { status: 500 });
    }
}
