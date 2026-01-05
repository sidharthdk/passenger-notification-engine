import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { bookingId, status } = await req.json(); // status: 'ON_TIME' | 'RUNNING_LATE' | 'MIGHT_MISS'

        if (!bookingId || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const { error } = await supabase
            .from('bookings')
            .update({ passenger_status: status })
            .eq('id', bookingId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
