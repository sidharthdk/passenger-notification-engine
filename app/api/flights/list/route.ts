import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('flights')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        // If data is empty, maybe fallback to mock too? 
        // For now, only on error.
        return NextResponse.json(data);

    } catch (err: any) {
        console.error('Database connection failed, falling back to MOCK DATA:', err.message);

        // MOCK DATA FALLBACK
        const mockFlights = [
            {
                id: 'mock-1',
                flight_number: 'MOCK-101',
                status: 'ON_TIME',
                delay_minutes: 0,
                created_at: new Date().toISOString()
            },
            {
                id: 'mock-2',
                flight_number: 'MOCK-202 (Delayed)',
                status: 'DELAYED',
                delay_minutes: 45,
                created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'mock-3',
                flight_number: 'MOCK-999 (Cancelled)',
                status: 'CANCELLED',
                delay_minutes: 0,
                created_at: new Date(Date.now() - 7200000).toISOString()
            }
        ];

        return NextResponse.json(mockFlights);
    }
}
