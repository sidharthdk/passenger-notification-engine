import { AuthProvider, AuthUser } from '../types';

export class LocalAuthProvider implements AuthProvider {
    private storageKey: string;
    private apiEndpoint: string;

    constructor(role: 'ADMIN' | 'PASSENGER') {
        this.storageKey = role === 'ADMIN' ? 'admin_session' : 'passenger_session';
        this.apiEndpoint = role === 'ADMIN' ? '/api/admin/auth' : '/api/passenger/login';
    }

    async login(credentials: any): Promise<AuthUser> {
        const res = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Authentication failed');
        }

        const user: AuthUser = {
            id: data.user?.id || data.passengerId, // normalize based on API
            name: data.user?.name || data.name,
            role: this.storageKey === 'admin_session' ? 'ADMIN' : 'PASSENGER',
            token: data.token
        };

        // Persist session
        localStorage.setItem(this.storageKey, JSON.stringify(user));
        return user;
    }

    async logout(): Promise<void> {
        localStorage.removeItem(this.storageKey);
        // Optional: Call logout API if sessions were server-side
    }

    async checkSession(): Promise<AuthUser | null> {
        const session = localStorage.getItem(this.storageKey);
        if (!session) return null;
        try {
            return JSON.parse(session) as AuthUser;
        } catch {
            return null;
        }
    }
}
