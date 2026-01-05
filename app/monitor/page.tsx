"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plane, Activity, RefreshCw, History, ArrowUpRight } from 'lucide-react';

interface Flight {
    id: string;
    flight_number: string;
    departure_time: string;
    arrival_time: string;
    status: string;
    delay_minutes: number;
    gate?: string;
    terminal?: string;
}

export default function MonitorPage() {
    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFlights = async () => {
        setLoading(true);
        try {
            // Fetch local state first for speed
            const res = await fetch('/api/flights/list');
            if (res.ok) {
                const data = await res.json();
                setFlights(data);
            }
        } catch (err) {
            console.error('Failed to fetch flights', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sync-flights'); // Real sync
            const data = await res.json();
            console.log('Sync result:', data);
            await fetchFlights(); // Reload DB state
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchFlights();
        const interval = setInterval(fetchFlights, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    // Helper to calculate Estimated Time
    const getEstimatedTime = (scheduledIso: string, delayMinutes: number) => {
        const date = new Date(scheduledIso);
        date.setMinutes(date.getMinutes() + delayMinutes);
        return date;
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity className="w-10 h-10 text-blue-600" /> Real-Time Flight Monitor
                    </h1>
                    <p style={{ color: '#666', marginTop: '0.5rem', marginLeft: '3.5rem' }}>Live tracking and delay assessment</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleSync}
                        disabled={loading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500
                        }}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Syncing...' : 'Check Live Status'}
                    </button>

                    <Link href="/alerts/history" passHref>
                        <button style={{
                            padding: '0.75rem 1.5rem',
                            background: '#334155',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 500
                        }}>
                            <History className="w-4 h-4" /> MCP History
                        </button>
                    </Link>
                </div>
            </header>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {flights.map(f => {
                    const scheduled = new Date(f.departure_time);
                    const estimated = getEstimatedTime(f.departure_time, f.delay_minutes);
                    const isDelayed = f.delay_minutes > 15;
                    const isCritical = f.delay_minutes > 60 || f.status === 'CANCELLED';

                    return (
                        <div key={f.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1.5rem',
                            background: 'white',
                            borderRadius: 'var(--radius)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            borderLeft: `6px solid ${isCritical ? '#ef4444' : isDelayed ? '#f97316' : '#10b981'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {f.flight_number}
                                        <a href={`/status/${f.id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8' }}>
                                            <ArrowUpRight className="w-5 h-5 hover:text-blue-500" />
                                        </a>
                                    </h2>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: '#f3f4f6',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        color: '#64748b'
                                    }}>
                                        Gate {f.gate || '--'} / Term {f.terminal || '--'}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '2rem', rowGap: '0.25rem' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>SCHEDULED</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#334155' }}>{formatTime(scheduled)}</div>

                                    <div style={{ color: isDelayed ? '#ef4444' : '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>ESTIMATED</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: isDelayed ? '#ef4444' : '#334155' }}>
                                        {formatTime(estimated)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: isCritical ? '#ef4444' : isDelayed ? '#f97316' : '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    justifyContent: 'flex-end'
                                }}>
                                    {f.status === 'ON_TIME' && <Plane className="w-6 h-6 transform -rotate-45" />}
                                    {f.status}
                                </div>
                                {f.delay_minutes > 0 && (
                                    <div style={{ color: '#ef4444', fontWeight: 600 }}>
                                        +{f.delay_minutes} min
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {flights.length === 0 && !loading && (
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>No active flights found.</p>
            )}
        </div>
    );
}
