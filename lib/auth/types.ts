export interface AuthUser {
    id: string;
    name: string;
    email?: string;
    role: 'ADMIN' | 'PASSENGER';
    token?: string; // JWT or Session Token
}

export interface AuthProvider {
    /**
     * Initiates the login process.
     * For Local: Returns the user object directly (or throws).
     * For OIDC: Redirects the browser to the IDP.
     */
    login(credentials?: any): Promise<AuthUser | void>;

    /**
     * Logs the user out.
     */
    logout(): Promise<void>;

    /**
     * Checks if the user is typically authenticated (client-side check).
     */
    checkSession(): Promise<AuthUser | null>;
}
