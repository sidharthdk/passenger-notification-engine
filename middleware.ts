import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // 1. Protection for Admin Routes
    if (path.startsWith('/admin')) {
        // Exception: Login page itself
        if (path === '/admin/login') return NextResponse.next();

        // Check for NextAuth Session Token
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET
        });

        // Also check for legacy or manual token if you still have that logic, 
        // but for now we rely on NextAuth.

        if (!token) {
            const url = new URL('/admin/login', request.url);
            url.searchParams.set('callbackUrl', path);
            return NextResponse.redirect(url);
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
