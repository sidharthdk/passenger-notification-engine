import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Protection for Admin Routes
    if (path.startsWith('/admin')) {
        // Exception: Login page itself
        if (path === '/admin/login') return NextResponse.next();

        // Check for Admin Session Cookie
        // In our Hybrid model, Keycloak callback will set 'admin_token'
        const adminToken = request.cookies.get('admin_token')?.value;

        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // 2. Protection for Passenger Routes
    if (path.startsWith('/passenger/dashboard')) {
        // Check for Passenger Session Cookie (PNR based)
        const passengerToken = request.cookies.get('passenger_token')?.value;

        if (!passengerToken) {
            return NextResponse.redirect(new URL('/passenger/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/passenger/dashboard/:path*',
    ],
};
