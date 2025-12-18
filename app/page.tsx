import { supabase } from '@/lib/supabase';

export const revalidate = 0;

export default async function LandingPage() {
  return (
    <main>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 0',
        background: 'linear-gradient(to bottom right, #eff6ff, #fff)',
        borderRadius: '1rem',
        marginBottom: '3rem',
        border: '1px solid #bfdbfe'
      }}>
        <h1 style={{ fontSize: '3rem', color: '#1e3a8a', marginBottom: '1rem' }}>
          SkyAlert Notification Engine
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 2rem' }}>
          The intelligent flight companion that keeps passengers informed in real-time about delays, cancellations, and disruptions.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ textAlign: 'left', width: '300px' }}>
            <h3>👮‍♂️ For Airlines (Admin)</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
              Manage flight statuses and trigger notifications manually.
            </p>
            <a href="/admin" className="btn" style={{ width: '100%' }}>Login as Admin</a>
          </div>

          <div className="card" style={{ textAlign: 'left', width: '300px' }}>
            <h3>✈️ For Passengers</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
              Check your flight status, rebook, or claim compensation.
            </p>

            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <a href="/login" className="btn btn-secondary" style={{ width: '100%' }}>Login</a>
              <a href="/signup" className="btn btn-outline" style={{ width: '100%' }}>Sign Up</a>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Description */}
      <section style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Why SkyAlert?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3>⚡ Real-time Alerts</h3>
            <p style={{ color: '#666' }}>Instant notifications via Email, SMS, and WhatsApp whenever a flight is delayed by more than 30 minutes.</p>
          </div>
          <div>
            <h3>🌍 Multi-language</h3>
            <p style={{ color: '#666' }}>Automatically communicates with passengers in their preferred language (English, Spanish, etc.).</p>
          </div>
          <div>
            <h3>🛡️ Smart Handling</h3>
            <p style={{ color: '#666' }}>Provides actionable "Next Steps" for cancellations, including rebooking links and compensation rights.</p>
          </div>
          <div>
            <h3>📊 Admin Dashboard</h3>
            <p style={{ color: '#666' }}>Full control center for operations teams to manage exceptions and monitor outgoing messages.</p>
          </div>
        </div>
      </section>

      {/* Debug Section */}
      <section style={{ borderTop: '1px solid #eee', paddingTop: '2rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#999', marginBottom: '1rem' }}>Recent Users (Debug View for Testing Login)</h3>
        <RecentUsersList />
      </section>
    </main>
  );
}

async function RecentUsersList() {
  const { data: users } = await supabase
    .from('passengers')
    .select(`id, name, email`)
    .order('id', { ascending: false }) // ordered by uuid isn't great but created_at missing on passengers table in original schema
    .limit(5);

  if (!users) return null;

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {users.map((u: any) => (
        <div key={u.id} style={{ background: '#f8f9fa', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #e9ecef', fontSize: '0.85rem' }}>
          <strong>{u.name}</strong><br />
          <span style={{ color: '#666' }}>{u.email}</span>
        </div>
      ))}
    </div>
  )
}
