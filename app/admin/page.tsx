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
        <main>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Panel</h1>
                <button onClick={fetchFlights} className="btn btn-outline">Refresh Data</button>
            </header>

            {loading && <p>Loading flights...</p>}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {flights.map(f => (
                    <div key={f.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>{f.flight_number}</h3>
                                <span className={`badge ${f.status}`}>{f.status}</span>
                            </div>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Delay: {f.delay_minutes} min
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => updateFlight(f.id, { delay_minutes: 0, status: 'ON_TIME' })}
                                className="btn btn-outline"
                                disabled={f.status === 'ON_TIME'}
                            >
                                Set On Time
                            </button>

                            <button
                                onClick={() => updateFlight(f.id, { delay_minutes: 45, status: 'DELAYED' })}
                                className="btn btn-warning"
                            >
                                +45m Delay
                            </button>

                            <button
                                onClick={() => updateFlight(f.id, { status: 'CANCELLED' })}
                                className="btn btn-danger"
                            >
                                Cancel Flight
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
