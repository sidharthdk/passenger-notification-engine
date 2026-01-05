export const revalidate = 0;

export default async function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Intelligent Flight Notifications<br />
          <span style={{ fontWeight: 300, color: 'var(--text-muted)', fontSize: '0.7em' }}>Powered by MCP Decision Engine</span>
        </h1>
        <p className="hero-subtitle">
          Real-time alerts, proactive rebooking, and multi-language support ensuring passengers stay informed during disruptions.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'left', maxWidth: '400px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Airline Operations
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Monitor system-wide alerts, approve exception handling, and manage flight statuses.
            </p>
            <a href="/admin" className="btn btn-primary btn-full">Access Admin Console &rarr;</a>
          </div>

          <div className="card" style={{ textAlign: 'left', maxWidth: '400px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              Flight Monitor
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Public view of flight arrivals, delays, and current airport status.
            </p>
            <a href="/monitor" className="btn btn-outline btn-full">View Flight Board &rarr;</a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section">
        <div className="text-center mb-12">
          <h2>Enterprise Capabilities</h2>
          <p>Built for reliability and scale.</p>
        </div>

        <div className="feature-grid">
          <div className="card feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time Logic</h3>
            <p>
              Micro-second decision engine evaluating delays against 30+ complex rules before triggering alerts.
            </p>
          </div>

          <div className="card feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Global Reach</h3>
            <p>
              Auto-translated notifications in 50+ languages sent via SMS, Email, and WhatsApp.
            </p>
          </div>

          <div className="card feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Compliance Ready</h3>
            <p>
              Examples of automated compensation rights (EU261) and rebooking options included in alerts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
