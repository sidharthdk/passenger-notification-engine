'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Monitor, History, RefreshCw, CheckCircle, Clock, Ban, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
    const [flights, setFlights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingFlightId, setCancellingFlightId] = useState<string | null>(null);
    const [confirmationText, setConfirmationText] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);

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
        // Security Check
        const session = localStorage.getItem('admin_session');
        if (!session) {
            window.location.href = '/admin/login';
        } else {
            setIsAuthorized(true);
            fetchFlights();
        }
    }, []);

    if (!isAuthorized) {
        return null;
    }

    const updateFlight = async (id: string, updates: any) => {
        const original = flights;
        // Optimistic update
        setFlights(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

        await fetch('/api/flights', { method: 'PUT', body: JSON.stringify({ id, ...updates }) });
        // Reload to ensure consistency
        fetchFlights();
    };

    const handleCancelClick = (id: string) => {
        setCancellingFlightId(id);
        setConfirmationText('');
    };

    const confirmCancellation = async () => {
        if (cancellingFlightId && confirmationText.toLowerCase() === 'cancel') {
            await updateFlight(cancellingFlightId, { status: 'CANCELLED' });
            setCancellingFlightId(null);
            setConfirmationText('');
        }
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
                borderRadius: 'var(--radius)',
                backdropFilter: 'blur(10px)',
                border: '1px solid white'
            }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem', fontSize: '2rem' }}>Flight Control</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Manage live operations and triggers</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href="/monitor">
                        <button className="btn btn-outline" style={{ background: 'white' }}>
                            <Monitor className="w-4 h-4 mr-2" style={{ marginRight: '8px' }} /> Live Monitor
                        </button>
                    </Link>
                    <Link href="/alerts/history">
                        <button className="btn btn-outline" style={{ background: 'white' }}>
                            <History className="w-4 h-4 mr-2" style={{ marginRight: '8px' }} /> MCP History
                        </button>
                    </Link>
                    <button onClick={fetchFlights} className="btn btn-outline" style={{ background: 'white' }}>
                        <RefreshCw className="w-4 h-4 mr-2" style={{ marginRight: '8px' }} /> Refresh Data
                    </button>
                </div>
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
                                <CheckCircle className="w-4 h-4 mr-2" style={{ marginRight: '6px' }} /> On Time
                            </button>

                            <button
                                onClick={() => updateFlight(f.id, { delay_minutes: 45, status: 'DELAYED' })}
                                className="btn btn-warning"
                                style={{ width: '100%', fontSize: '0.8rem' }}
                            >
                                <Clock className="w-4 h-4 mr-2" style={{ marginRight: '6px' }} /> +45m Delay
                            </button>

                            <button
                                onClick={() => handleCancelClick(f.id)}
                                className="btn btn-danger"
                                style={{ gridColumn: '1 / -1', width: '100%' }}
                            >
                                <Ban className="w-4 h-4 mr-2" style={{ marginRight: '6px' }} /> Cancel Flight
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {cancellingFlightId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: 'var(--radius)',
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.5rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle className="w-6 h-6" /> Confirm Cancellation
                        </h3>
                        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
                            Are you sure you want to cancel this flight? This action cannot be undone immediately.
                            please type <strong>cancel</strong> below to confirm.
                        </p>

                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="Type 'cancel' to confirm"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #d1d5db',
                                marginBottom: '1.5rem',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setCancellingFlightId(null);
                                    setConfirmationText('');
                                }}
                                className="btn btn-outline"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={confirmCancellation}
                                disabled={confirmationText.toLowerCase() !== 'cancel'}
                                className="btn btn-danger"
                                style={{
                                    opacity: confirmationText.toLowerCase() !== 'cancel' ? 0.5 : 1,
                                    cursor: confirmationText.toLowerCase() !== 'cancel' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
