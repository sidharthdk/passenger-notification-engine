'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', language: 'en' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
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
                <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h1>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Phone Number (Optional)</label>
                        <input
                            type="tel"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Preferred Language</label>
                        <select
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            value={form.language}
                            onChange={e => setForm({ ...form, language: e.target.value })}
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn"
                        style={{ marginTop: '1rem', width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Dashboard...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
                    Already have an account? <a href="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>Login here</a>
                </p>
            </div>
        </div>
    );
}
