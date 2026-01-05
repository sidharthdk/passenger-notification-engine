import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const passengerId = searchParams.get('passengerId');

    if (!passengerId) {
        return NextResponse.json({ error: 'Missing passengerId' }, { status: 400 });
    }

    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            *,
            flight:flights(*)
        `)
        .eq('passenger_id', passengerId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(bookings);
}
