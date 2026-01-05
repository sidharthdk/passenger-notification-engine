import { NextRequest } from 'next/server';

/**
 * Verifies if the request is from an authorized admin.
 * In production, this would validate a Keycloak/Okta token.
 * For this environment, we enforce a header check or environment secret.
 */
export function verifyAdmin(req: NextRequest): boolean {
    const authHeader = req.headers.get('Authorization');

    // Strict enforcement: Must have a header.
    // In real Keycloak, we'd verify the JWT signature.
    // Here we check for a simulated Bearer token or API Key.
    if (!authHeader) {
        return false;
    }

    // Allow a "Super Admin" secret or standard "Bearer mock-token"
    if (authHeader === 'Bearer mock-admin-token' || authHeader === `Bearer ${process.env.ADMIN_API_KEY}`) {
        return true;
    }

    return false;
}
