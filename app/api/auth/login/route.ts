import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Find Passenger
        const { data: passenger, error: pErr } = await supabase
            .from('passengers')
            .select('id')
            .eq('email', email)
            .single();

        if (pErr || !passenger) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Find Latest Booking
        const { data: booking, error: bErr } = await supabase
            .from('bookings')
            .select('id')
            .eq('passenger_id', passenger.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (bErr || !booking) {
            return NextResponse.json({ error: 'No bookings found for this user' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            redirectUrl: `/status/${booking.id}`
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
    }
}
