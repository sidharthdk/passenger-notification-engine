import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { pnr, lastName } = await req.json();

        if (!pnr || !lastName) {
            return NextResponse.json({ error: 'Booking Reference and Last Name required' }, { status: 400 });
        }

        // 1. Find Booking by PNR (Check if exists)
        // We join to passengers to check valid name
        const { data: booking, error } = await supabase
            .from('bookings')
            .select(`
                id,
                pnr,
                passenger:passengers (
                    id,
                    name
                )
            `)
            .eq('pnr', pnr)
            .single();

        if (error || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // 2. Validate Last Name (Simple check)
        const fullName = (booking.passenger as any)?.name || '';
        // Case insensitive check if lastName is part of fullName
        if (!fullName.toLowerCase().includes(lastName.toLowerCase())) {
            return NextResponse.json({ error: 'Invalid Passenger Name for this booking' }, { status: 401 });
        }

        // 3. Create Session Response
        const response = NextResponse.json({
            success: true,
            passengerId: (booking.passenger as any).id,
            name: fullName
        });

        // 4. Set Cookie (Strictly HttpOnly to prevent XSS, though we need it in client for now? 
        // No, middleware reads it. Dashboard generic fetch can use it?)
        // Let's allow JS access for now if needed, or strictly HttpOnly.
        // Dashboard currently uses localStorage.
        // We will transition to mostly Server Components later, but for now 
        // let's set it so Middleware sees it.
        response.cookies.set('passenger_token', (booking.passenger as any).id, {
            httpOnly: false, // Allow client to read if needed for legacy logic
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
