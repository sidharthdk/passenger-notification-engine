import { LocalAuthProvider } from './providers/local';
import { KeycloakAuthProvider } from './providers/keycloak';
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
            // Staff/Ops -> Keysloak/Okta
            return new KeycloakAuthProvider();
        } else {
            // Passengers -> PNR/Local
            return new LocalAuthProvider(role);
        }
    }
}
