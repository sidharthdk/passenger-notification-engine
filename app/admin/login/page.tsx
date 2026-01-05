"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth/service';
import { Shield, Lock, UserCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const authProvider = AuthService.getProvider('ADMIN');
            await authProvider.login({ username, password });
            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Access Denied');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: '#1e293b', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #334155' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ background: '#ef4444', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }}>
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', letterSpacing: '0.025em' }}>Restricted Area</h1>
                    <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>South Indian Airways Ops Control</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operator ID</label>
                        <div style={{ position: 'relative' }}>
                            <UserCheck className="w-5 h-5 text-slate-500" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                                placeholder="admin"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock className="w-5 h-5 text-slate-500" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', outline: 'none' }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Access Control Panel'}
                    </button>

                    <a href="/" style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', marginTop: '1rem' }}>
                        ← Return to Public Site
                    </a>
                </form>
            </div>
        </div>
    );
}
