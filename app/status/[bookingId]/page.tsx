import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { NEXT_STEPS } from '@/lib/templates';

interface PageProps {
    params: Promise<{
        bookingId: string;
    }>;
}

export const revalidate = 0; // Disable cache for live status

export default async function StatusPage(props: PageProps) {
    const params = await props.params;
    const { bookingId } = params;

    // Fetch booking and passenger
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
      *,
      passengers (
        preferred_language
      )
    `)
        .eq('id', bookingId)
        .single();

    if (bookingError || !booking) {
        return notFound();
    }

    // Fetch flight
    const { data: flight, error: flightError } = await supabase
        .from('flights')
        .select('*')
        .eq('id', booking.flight_id)
        .single();

    if (flightError || !flight) {
        return <div>Flight not found</div>;
    }

    const passenger = (booking as any).passengers;
    const lang = passenger?.preferred_language || 'en';

    // Status Colors
    const statusColor: Record<string, string> = {
        ON_TIME: 'green',
        DELAYED: 'orange',
        CANCELLED: 'red',
    };
    const color = statusColor[flight.status] || 'gray';

    // Next steps logic
    const nextStepsText = (NEXT_STEPS as any)[lang] || NEXT_STEPS['en'];

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1>Flight Status</h1>

            <div style={{
                border: '1px solid #ccc',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '1rem'
            }}>
                <h2>Flight {flight.flight_number}</h2>
                <p><strong>Status:</strong> <span style={{ color: color, fontWeight: 'bold' }}>{flight.status}</span></p>

                {flight.delay_minutes > 0 && (
                    <p style={{ color: 'orange' }}>
                        <strong>Delay:</strong> {flight.delay_minutes} minutes
                    </p>
                )}

                <p><strong>Departure:</strong> {new Date(flight.departure_time).toLocaleString()}</p>
                <p><strong>Arrival:</strong> {new Date(flight.arrival_time).toLocaleString()}</p>
            </div>

            {(flight.status === 'CANCELLED' || flight.delay_minutes >= 30) && (
                <div style={{
                    border: '1px solid #ddd',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    background: '#f9f9f9'
                }}>
                    <h3>Next Steps</h3>
                    <p>{nextStepsText}</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Track Flight</button>
                        {(flight.status === 'CANCELLED') && (
                            <button style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#e00', color: '#fff' }}>Rebook Now</button>
                        )}
                        <button style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Claim Compensation</button>
                    </div>
                </div>
            )}
        </main>
    );
}
