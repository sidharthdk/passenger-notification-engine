import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { NEXT_STEPS } from '@/lib/templates';

// Force dynamic rendering so it refreshes on load
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        bookingId: string;
    }>;
}

export default async function StatusPage(props: PageProps) {
    const params = await props.params;
    const { bookingId } = params;

    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
      *,
      passengers(*),
      flights(*)
    `)
        .eq('id', bookingId)
        .single();

    if (error || !booking) return notFound();

    const flight = (booking as any).flights;
    const passenger = (booking as any).passengers;
    const lang = passenger?.preferred_language || 'en';

    const status = flight.status;
    const nextStepsText = (NEXT_STEPS as any)[lang] || NEXT_STEPS['en'];

    return (
        <main style={{ maxWidth: 600, margin: '2rem auto' }}>
            {/* Auto refresh meta tag for "Live" feel */}
            <meta httpEquiv="refresh" content="30" />

            <div style={{ marginBottom: '1rem' }}>
                <a href="/" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>&larr; Back to Dashboard</a>
            </div>

            <div className="card">
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h1 style={{ marginBottom: '0.25rem' }}>Flight {flight.flight_number}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Passenger: {passenger.name}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</div>
                        <div style={{ marginTop: '0.25rem' }}>
                            <span className={`badge ${status}`}>{status}</span>
                        </div>
                    </div>
                    {flight.delay_minutes > 0 && (
                        <div>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Delay</div>
                            <strong style={{ color: '#ea580c', fontSize: '1.25rem' }}>+{flight.delay_minutes} min</strong>
                        </div>
                    )}
                </div>

                <div style={{ background: 'var(--bg-page)', padding: '1rem', borderRadius: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>DEPARTURE</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(flight.departure_time).toLocaleDateString()}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>ARRIVAL</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                            {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {/* Action Card for disruptions */}
                {(status === 'CANCELLED' || flight.delay_minutes >= 30) && (
                    <div style={{ marginTop: '2rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.5rem', padding: '1rem' }}>
                        <h3 style={{ color: '#b45309', marginBottom: '0.5rem' }}>⚠️ Action Required</h3>
                        <p style={{ marginBottom: '1rem' }}>{nextStepsText}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {status === 'CANCELLED' && (
                                <button className="btn btn-danger">Rebook Flight</button>
                            )}
                            <button className="btn btn-outline" style={{ background: 'white' }}>Track Inbound</button>
                            <button className="btn btn-outline" style={{ background: 'white' }}>Compensation Rights</button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
