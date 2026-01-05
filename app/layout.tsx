import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passenger Notification Engine',
  description: 'Flight Status & Notifications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container nav-content">
            <a href="/" className="logo">
              <span>✈️</span> SkyAlert
            </a>
            <div className="nav-links">
              <a href="/">Dashboard</a>
              <a href="/admin">Admin Panel</a>
              <a href="/monitor">Monitor</a>
            </div>
          </div>
        </nav>
        <main className="container" style={{ minHeight: '80vh' }}>
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <div className="container">
            &copy; {new Date().getFullYear()} SkyAlert Systems. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
