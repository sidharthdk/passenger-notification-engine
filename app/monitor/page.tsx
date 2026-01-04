"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
        // Sync with AviationStack in Simulation Mode to get "Live" delay data without mutating DB
        // But for "Monitor", we probably want the actual DB state if we are "Deciding" based on stored data?
        // User said: "create a realtime alert page ... decide if the flight is delayed or not".
        // If we use simulate=true, we get "updates" array.
        // Let's call Sync in SIMULATION mode and merge with local data to show "Live vs Stored" or just "Live View".
        // Actually, simplest is to just sync for real (simulate=false) if we want "Realtime Alert Page".
        // But let's stick to safe defaults. I'll just refresh the data from DB (assuming background sync or manual sync happened).
        // OR better: Invoke the sync API to "Refresh" the DB state.

        try {
            // Provide a way to "Check Live Status"
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
                    <h1 style={{ margin: 0, fontSize: '2.5rem' }}>✈️ Real-Time Flight Monitor</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>Live tracking and delay assessment</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleSync}
                        disabled={loading}
                        style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Syncing...' : '🔄 Check Live Status'}
                    </button>

                    <Link href="/alerts/history" passHref>
                        <button style={{ padding: '0.75rem 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            📜 MCP History
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
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            borderLeft: `6px solid ${isCritical ? 'red' : isDelayed ? 'orange' : '#10b981'}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '2rem' }}>{f.flight_number}</h2>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: '#f3f4f6',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        color: '#666'
                                    }}>
                                        Gate {f.gate || '--'} / Term {f.terminal || '--'}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', columnGap: '2rem', rowGap: '0.25rem' }}>
                                    <div style={{ color: '#999', fontSize: '0.9rem' }}>SCHEDULED</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatTime(scheduled)}</div>

                                    <div style={{ color: isDelayed ? 'red' : '#999', fontSize: '0.9rem' }}>ESTIMATED</div>
                                    <div style={{ fontWeight: 600, fontSize: '1.1rem', color: isDelayed ? 'red' : 'inherit' }}>
                                        {formatTime(estimated)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: isCritical ? 'red' : isDelayed ? 'orange' : '#10b981'
                                }}>
                                    {f.status}
                                </div>
                                {f.delay_minutes > 0 && (
                                    <div style={{ color: 'red', fontWeight: 600 }}>
                                        +{f.delay_minutes} min
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {flights.length === 0 && !loading && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>No active flights found.</p>
            )}
        </div>
    );
}
