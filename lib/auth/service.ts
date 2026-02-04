import { LocalAuthProvider } from './providers/local';

import { AuthProvider } from './types';

// Configuration flag to switch modes
const USE_OIDC = process.env.NEXT_PUBLIC_AUTH_MODE === 'oidc';

export class AuthService {
    /**
     * Returns the appropriate provider implementation.
     * @param role Context of the login (Admin vs Passenger)
     */
    static getProvider(role: 'ADMIN' | 'PASSENGER'): AuthProvider {
        if (role === 'ADMIN') {
            // DEPRECATED: Admin auth is now handled by NextAuth (lib/auth.ts)
            throw new Error("Admin Auth should use NextAuth, not AuthService");
        } else {
            // Passengers -> PNR/Local
            return new LocalAuthProvider(role);
        }
    }
}
