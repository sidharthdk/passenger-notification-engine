import { AuthProvider, AuthUser } from '../types';

/**
 * Skeleton for Keycloak/OIDC Provider.
 * This will use 'keycloak-js' or generic OIDC client in the future.
 */
export class KeycloakAuthProvider implements AuthProvider {
    private config: any;

    constructor() {
        this.config = {
            url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
            realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
            clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
        };
    }

    async login(): Promise<void> {
        console.log('[OIDC] Redirecting to Provider...', this.config);

        const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/keycloak` : '';

        // Support nice generic OIDC URL if provided (Classic Okta style)
        // Otherwise fallback to Keycloak default path
        let baseUrl = process.env.NEXT_PUBLIC_OIDC_AUTH_URL;
        if (!baseUrl) {
            baseUrl = `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/auth`;
        }

        const target = `${baseUrl}?client_id=${this.config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid email profile`;

        window.location.href = target;
    }

    async logout(): Promise<void> {
        console.log('[OIDC] Logging out from Keycloak...');
        // window.location.href = ... build Logout url ...
    }

    async checkSession(): Promise<AuthUser | null> {
        // Here we would check cookies or validate the fragment token
        console.log('[OIDC] Checking session...');
        return null;
    }
}
