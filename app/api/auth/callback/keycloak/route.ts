import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        // Exchange Code for Token
        // Exchange Code for Token
        // STRICT KEYCLOAK ENFORCEMENT
        const tokenEndpoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!);
        params.append('client_secret', process.env.AUTH_KEYCLOAK_SECRET!);
        params.append('code', code);
        params.append('redirect_uri', `${new URL(req.url).origin}/api/auth/callback/keycloak`);

        const res = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        const data = await res.json();

        if (!res.ok) {
            console.error('OIDC Error:', data);
            return NextResponse.json({ error: 'Token exchange failed', details: data }, { status: 401 });
        }

        // Success! We have an access_token.
        const accessToken = data.access_token;

        // Extract Roles using 'jose'
        let roles: string[] = [];
        try {
            const payload = decodeJwt(accessToken);
            // Keycloak usually puts roles in realm_access.roles or resource_access[client].roles
            const realmRoles = (payload.realm_access as any)?.roles || [];
            roles = realmRoles;
            console.log("User Roles Extracted:", roles);
        } catch (e) {
            console.error("Failed to decode token for role extraction", e);
        }

        // Create Response
        const response = NextResponse.redirect(new URL('/admin', req.url));

        // Set Admin Session Cookie (Assuming existence of token implies access for MVP, or check roles includes 'admin')
        response.cookies.set('admin_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 12 // 12 hours
        });

        return response;

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
