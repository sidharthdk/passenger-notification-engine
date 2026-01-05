import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json([]);
    }

    // ILIKE for case-insensitive partial match
    const { data: flights, error } = await supabase
        .from('flights')
        .select('*')
        .ilike('flight_number', `%${q}%`)
        .limit(5);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(flights);
}
