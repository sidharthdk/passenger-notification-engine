"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Lock, User } from 'lucide-react';

import { AuthService } from '@/lib/auth/service';

export default function PassengerLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const authProvider = AuthService.getProvider('PASSENGER');
            await authProvider.login({ email, password });
            router.push('/passenger/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ background: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Plane className="w-8 h-8 text-blue-600" />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>South Indian Airways</h1>
                <p style={{ color: '#64748b' }}>Passenger Portal Access</p>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <User className="w-5 h-5 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                            placeholder="passenger@example.com"
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock className="w-5 h-5 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                            placeholder="Your booking password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Verifying...' : 'Sign In to Dashboard'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                Forgot your password? <a href="#" style={{ color: '#0ea5e9', textDecoration: 'none' }}>Contact Support</a>
            </div>
        </div>
    );
}
