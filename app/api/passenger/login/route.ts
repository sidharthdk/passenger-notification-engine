import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Simple Login API for MVP
// In production, we'd use Supabase Auth or Session Cookies.
// Here we just verify credentials and return a "session token" (passenger ID).

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        // 1. Find Passenger
        const { data: passenger, error } = await supabase
            .from('passengers')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !passenger) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Check Password (Plaintext for MVP Demo as per plan)
        // In prod: await bcrypt.compare(password, passenger.password)
        if (passenger.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Return Success
        // Client will store 'passengerId' in localStorage for this demo session.
        return NextResponse.json({
            success: true,
            passengerId: passenger.id,
            name: passenger.name
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
