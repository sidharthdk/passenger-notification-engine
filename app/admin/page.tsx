'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
    const [flights, setFlights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFlights = async () => {
        setLoading(true);
        const res = await fetch('/api/flights/list');
        if (res.ok) {
            const data = await res.json();
            setFlights(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    const updateFlight = async (id: string, updates: any) => {
        const original = flights;
        // Optimistic update
        setFlights(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

        await fetch('/api/flights', { method: 'PUT', body: JSON.stringify({ id, ...updates }) });
        // Reload to ensure consistency
        fetchFlights();
    };

    return (
        <main style={{ padding: '2rem 0' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem',
                background: 'rgba(255,255,255,0.5)',
                padding: '1.5rem',
                borderRadius: '1.5rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid white'
            }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem', fontSize: '2rem' }}>Flight Control</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage live operations and triggers</p>
                </div>
                <button onClick={fetchFlights} className="btn btn-outline" style={{ background: 'white' }}>🔄 Refresh Data</button>
            </header>

            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    Loading flight data...
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {flights.map(f => (
                    <div key={f.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.75rem', letterSpacing: '-0.05em' }}>{f.flight_number}</h3>
                                <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {f.delay_minutes > 0 ? `Delayed by ${f.delay_minutes}m` : 'On Schedule'}
                                </p>
                            </div>
                            <span className={`badge ${f.status}`} style={{ fontSize: '0.85rem' }}>{f.status}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                onClick={() => updateFlight(f.id, { delay_minutes: 0, status: 'ON_TIME' })}
                                className="btn btn-outline"
                                disabled={f.status === 'ON_TIME'}
                                style={{ width: '100%', fontSize: '0.8rem' }}
                            >
                                ✅ On Time
                            </button>

                            <button
                                onClick={() => updateFlight(f.id, { delay_minutes: 45, status: 'DELAYED' })}
                                className="btn btn-warning"
                                style={{ width: '100%', fontSize: '0.8rem' }}
                            >
                                ⚠️ +45m Delay
                            </button>

                            <button
                                onClick={() => updateFlight(f.id, { status: 'CANCELLED' })}
                                className="btn btn-danger"
                                style={{ gridColumn: '1 / -1', width: '100%' }}
                            >
                                🛑 Cancel Flight
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
