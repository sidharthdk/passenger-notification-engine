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

        if (!this.config.url || !this.config.realm || !this.config.clientId) {
            console.error("Keycloak Configuration Missing:", this.config);
            // Optionally throw error or handle gracefully, but logging is critical
        }
    }

    async login(): Promise<void> {
        console.log('[OIDC] Redirecting to Provider...', this.config);

        const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/keycloak` : '';

        // Support nice generic OIDC URL if provided (Classic Okta style)
        // Otherwise fallback to Keycloak default path
        // STRICT KEYCLOAK ENFORCEMENT: Ignore generic OIDC/Okta URLs
        // We must initiate via Keycloak to allow it to broker the connection to Okta.
        const baseUrl = `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/auth`;

        const target = `${baseUrl}?client_id=${this.config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid email profile`;

        window.location.href = target;
    }

    async logout(): Promise<void> {
        console.log('[OIDC] Logging out from Keycloak...');
        // window.location.href = ... build Logout url ...
    }

    async checkSession(): Promise<AuthUser | null> {
        try {
            const res = await fetch('/api/auth/session');
            if (!res.ok) return null;

            const data = await res.json();
            if (data.user) {
                return data.user as AuthUser;
            }
            return null;
        } catch (e) {
            console.error('Session Check Failed', e);
            return null;
        }
    }
}
