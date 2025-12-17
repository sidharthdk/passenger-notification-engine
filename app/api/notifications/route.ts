import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/lib/notificationService';

// Internal trigger to manually send a notification (e.g., for testing or manual override)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bookingId, channel, message } = body;

        if (!bookingId || !channel || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify booking exists
        const { data: booking, error } = await supabase
            .from('bookings')
            .select('passenger_id')
            .eq('id', bookingId)
            .single();

        if (error || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        await sendNotification(bookingId, booking.passenger_id, channel, {
            message,
            type: 'MANUAL',
            manual: true
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
