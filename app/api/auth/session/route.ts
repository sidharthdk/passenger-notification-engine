import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

export async function GET(req: NextRequest) {
    const adminToken = req.cookies.get('admin_token')?.value;

    if (!adminToken) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    try {
        // Decode the JWT to get user details (Client-side usage mainly)
        // In a real app, verify signature with JWKS
        const claims = decodeJwt(adminToken);

        return NextResponse.json({
            user: {
                id: claims.sub,
                name: claims.name || claims.preferred_username || 'Admin User',
                email: claims.email,
                role: 'ADMIN',
                token: adminToken
            }
        });
    } catch (e) {
        console.error('Session Decode Error:', e);
        return NextResponse.json({ user: null }, { status: 401 });
    }
}
