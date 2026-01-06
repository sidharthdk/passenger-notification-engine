"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Plane, Clock, AlertTriangle, CheckCircle,
    CreditCard, DollarSign, RefreshCw
} from 'lucide-react';

export default function PassengerDashboard() {
    const router = useRouter();
    const [passenger, setPassenger] = useState<any>(null);
    const [query, setQuery] = useState('');
    const [searchedFlight, setSearchedFlight] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Load Session
    useEffect(() => {
        const session = localStorage.getItem('passenger_session');
        if (!session) {
            router.push('/passenger/login');
        } else {
            setPassenger(JSON.parse(session));
            fetchBookings(JSON.parse(session).id);
        }
    }, []);

    const fetchBookings = async (passengerId: string) => {
        setRefreshing(true);
        try {
            // In a real app, strict auth middleware would prevent fetching other's bookings.
            // For this MVP, we pass passengerId in query.
            const res = await fetch(`/api/passenger/bookings?passengerId=${passengerId}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSearchedFlight(null);
        try {
            // Search by Flight Number or ID
            const res = await fetch(`/api/flights/search?q=${query}`);
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) setSearchedFlight(data[0]); // Just pick first match
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (bookingId: string, status: string) => {
        // Optimistic Update
        const updatedBookings = bookings.map(b =>
            b.id === bookingId ? { ...b, passenger_status: status } : b
        );
        setBookings(updatedBookings);

        try {
            await fetch('/api/passenger/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId, status })
            });
            // Background refresh to ensure consistency
            fetchBookings(passenger?.id);
        } catch (e) {
            console.error(e);
            // Revert on error could be added here, but usually fetchBookings handles it next cycle
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

        // Optimistic Update
        const updatedBookings = bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        );
        setBookings(updatedBookings);

        try {
            await fetch('/api/passenger/cancel-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            });
            fetchBookings(passenger?.id);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1.5rem' }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Welcome, {passenger?.name}</h1>
                    <p style={{ color: '#64748b' }}>South Indian Airways Passenger Portal</p>
                </div>
                <button
                    onClick={() => { localStorage.removeItem('passenger_session'); router.push('/passenger/login'); }}
                    style={{ padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                    Sign Out
                </button>
            </header>

            {/* Feature 1: Flight Search */}
            <section style={{ marginBottom: '3rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search className="w-5 h-5 text-blue-500" /> Find a Flight
                </h2>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="Enter Flight Number (e.g. SIA-101)"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {searchedFlight && (
                    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{searchedFlight.flight_number}</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    {new Date(searchedFlight.departure_time).toLocaleString()}
                                </p>
                            </div>
                            <span style={{
                                padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold',
                                background: searchedFlight.status === 'ON_TIME' ? '#dcfce7' : searchedFlight.status === 'CANCELLED' ? '#fee2e2' : '#ffedd5',
                                color: searchedFlight.status === 'ON_TIME' ? '#166534' : searchedFlight.status === 'CANCELLED' ? '#991b1b' : '#9a3412'
                            }}>
                                {searchedFlight.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                )}
            </section>

            {/* Feature 2 & 3: My Bookings & Refund/Status */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plane className="w-5 h-5 text-indigo-500" /> My Bookings
                    </h2>
                    <button onClick={() => fetchBookings(passenger.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {bookings.length === 0 && !refreshing && <p style={{ color: '#94a3b8' }}>No bookings found.</p>}

                    {bookings.map(b => {
                        const isCancelled = b.status === 'CANCELLED' || b.flight.status === 'CANCELLED';
                        const canRefund = !isCancelled;

                        // Mock Refund Calculation: 
                        // If < 2h to departure: 0%
                        // If < 24h: 50%
                        // Else: 100%
                        const now = new Date();
                        const flightTime = new Date(b.flight.departure_time);
                        const hoursUntil = (flightTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                        let refundPct = 100;
                        if (hoursUntil < 2) refundPct = 0;
                        else if (hoursUntil < 24) refundPct = 50;

                        const refundAmount = (b.ticket_price || 0) * (refundPct / 100);

                        return (
                            <div key={b.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', opacity: isCancelled ? 0.7 : 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{b.flight.flight_number}</h3>
                                            {isCancelled && <span style={{ fontSize: '0.7rem', background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>CANCELLED</span>}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            Departs: {new Date(b.flight.departure_time).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${b.ticket_price || 0}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{b.fare_class}</div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '1rem', display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>

                                    {/* STATUS FEEDBACK */}
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                            MY STATUS (WILL I MAKE IT?)
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => !isCancelled && updateStatus(b.id, 'ON_TIME')}
                                                disabled={isCancelled}
                                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #fff', background: b.passenger_status === 'ON_TIME' ? '#dcfce7' : '#f1f5f9', color: b.passenger_status === 'ON_TIME' ? '#166534' : '#64748b', cursor: isCancelled ? 'not-allowed' : 'pointer', flex: 1 }}
                                            >
                                                <CheckCircle className="w-4 h-4 mx-auto" />
                                            </button>
                                            <button
                                                onClick={() => !isCancelled && updateStatus(b.id, 'RUNNING_LATE')}
                                                disabled={isCancelled}
                                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #fff', background: b.passenger_status === 'RUNNING_LATE' ? '#ffedd5' : '#f1f5f9', color: b.passenger_status === 'RUNNING_LATE' ? '#9a3412' : '#64748b', cursor: isCancelled ? 'not-allowed' : 'pointer', flex: 1 }}
                                            >
                                                <Clock className="w-4 h-4 mx-auto" />
                                            </button>
                                            <button
                                                onClick={() => !isCancelled && updateStatus(b.id, 'MIGHT_MISS')}
                                                disabled={isCancelled}
                                                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #fff', background: b.passenger_status === 'MIGHT_MISS' ? '#fee2e2' : '#f1f5f9', color: b.passenger_status === 'MIGHT_MISS' ? '#991b1b' : '#64748b', cursor: isCancelled ? 'not-allowed' : 'pointer', flex: 1 }}
                                            >
                                                <AlertTriangle className="w-4 h-4 mx-auto" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* REFUND CALCULATOR */}
                                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                                            <DollarSign className="w-3 h-3" /> CANCELLATION VALUE
                                        </label>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                                            <div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>
                                                    ${refundAmount.toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: refundPct < 100 ? '#ef4444' : '#10b981' }}>
                                                    ({refundPct}% Refund)
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCancelBooking(b.id)}
                                                disabled={!canRefund}
                                                style={{
                                                    padding: '4px 8px',
                                                    fontSize: '0.75rem',
                                                    background: canRefund ? '#ef4444' : '#94a3b8',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: canRefund ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                {isCancelled ? 'Cancelled' : 'Cancel & Refund'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
