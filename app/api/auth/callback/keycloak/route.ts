import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        // Exchange Code for Token
        // Support generic OIDC Token URL (Okta) or Keycloak default
        // STRICT KEYCLOAK ENFORCEMENT: Ignore generic OIDC/Okta URLs
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
        // Ideally we verify the signature, but for this bridge MVP we trust the direct channel.
        const accessToken = data.access_token;

        // Create Response
        const response = NextResponse.redirect(new URL('/admin', req.url));

        // Set Admin Session Cookie
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
