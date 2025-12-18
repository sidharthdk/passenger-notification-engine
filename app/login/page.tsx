'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (data.success) {
                router.push(data.redirectUrl);
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '4rem auto', fontFamily: 'system-ui' }}>
            <div className="card">
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h1>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="Enter your registered email"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Dummy password field for UX feel */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            placeholder="Any password works (Mock Auth)"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        style={{ marginTop: '1rem', width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                    Not registered yet? <a href="/signup" style={{ color: '#2563eb', textDecoration: 'underline' }}>Create Account</a>
                </p>
            </div>
        </div>
    );
}
