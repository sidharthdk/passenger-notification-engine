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
        <main style={{ maxWidth: 500, margin: '4rem auto' }}>
            <meta httpEquiv="refresh" content="30" />

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <a href="/" className="btn btn-outline" style={{ background: 'white', borderRadius: '2rem' }}>&larr; Search Another Flight</a>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                {/* Header Section */}
                <div style={{
                    padding: '2rem',
                    background: status === 'CANCELLED' ? 'var(--danger-bg)' :
                        status === 'DELAYED' ? 'var(--warning-bg)' :
                            'linear-gradient(135deg, var(--primary), var(--accent))',
                    color: status === 'ON_TIME' ? 'white' : 'var(--text-main)',
                    textAlign: 'center'
                }}>
                    <div style={{ opacity: 0.8, textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em' }}>Flight Status</div>
                    <h1 style={{ fontSize: '3rem', margin: '0.5rem 0', background: 'none', WebkitTextFillColor: 'unset' }}>{status.replace('_', ' ')}</h1>
                    {flight.delay_minutes > 0 && (
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>+{flight.delay_minutes} Minute Delay</div>
                    )}
                </div>

                {/* Body Section */}
                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{flight.flight_number}</div>
                            <div style={{ color: 'var(--text-muted)' }}>Passenger: {passenger.name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>{booking.seat_number || '10A'}</div>
                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-light)' }}>Seat</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', background: 'var(--bg-page)', borderRadius: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>DEPARTURE</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>ARRIVAL</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {(status === 'CANCELLED' || flight.delay_minutes >= 30) && (
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                {nextStepsText}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {status === 'CANCELLED' && (
                                    <button className="btn btn-danger" style={{ width: '100%' }}>Rebook Now</button>
                                )}
                                <button className="btn btn-outline" style={{ width: '100%' }}>View Compensation Rights</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
