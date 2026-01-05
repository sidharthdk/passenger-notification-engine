import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        // Hardcoded for MVP as discussed
        // In production, this would check against a secure DB or generic Auth provider
        const VALID_USER = 'admin';
        const VALID_PASS = process.env.ADMIN_PASSWORD || 'admin123';

        if (username === VALID_USER && password === VALID_PASS) {
            return NextResponse.json({
                success: true,
                token: 'mock_admin_token_secure_hash_123',
                user: { name: 'Super Admin', role: 'ADMIN' }
            });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
