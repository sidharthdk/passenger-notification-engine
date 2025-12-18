import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function LandingPage() {
  return (
    <main style={{ padding: '2rem 0' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
        backdropFilter: 'blur(20px)',
        borderRadius: '2rem',
        marginBottom: '4rem',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
          SkyAlert<br />
          <span style={{ fontSize: '2.5rem', opacity: 0.8, fontWeight: 400 }}>Notification Engine</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.8 }}>
          The intelligent flight companion that keeps passengers informed in real-time about delays, cancellations, and disruptions.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ textAlign: 'left', width: '350px', background: 'rgba(255,255,255,0.9)', border: '1px solid var(--primary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)' }}>
              <span>👮‍♂️</span> Airline Admin
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Manage flight statuses, trigger delays, and monitor system-wide alerts in real-time.
            </p>
            <a href="/admin" className="btn" style={{ width: '100%' }}>Login to Dashboard &rarr;</a>
          </div>
        </div>
      </section>

      {/* Features / Description */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', marginBottom: '6rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Why SkyAlert?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.25rem' }}>Real-time Alerts</h3>
            <p style={{ color: 'var(--text-muted)' }}>Instant notifications via Email, SMS, and WhatsApp whenever a flight is delayed by more than 30 minutes.</p>
          </div>
          <div className="card" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌍</div>
            <h3 style={{ fontSize: '1.25rem' }}>Multi-language</h3>
            <p style={{ color: 'var(--text-muted)' }}>Automatically communicates with passengers in their preferred language (English, Spanish, etc.).</p>
          </div>
          <div className="card" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛡️</div>
            <h3 style={{ fontSize: '1.25rem' }}>Smart Handling</h3>
            <p style={{ color: 'var(--text-muted)' }}>Provides actionable "Next Steps" for cancellations, including rebooking links and compensation rights.</p>
          </div>
          <div className="card" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.25rem' }}>Admin Dashboard</h3>
            <p style={{ color: 'var(--text-muted)' }}>Full control center for operations teams to manage exceptions and monitor outgoing messages.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
