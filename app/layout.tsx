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
            <a href="/" className="logo">✈️ SkyAlert</a>
            <div className="nav-links">
              <a href="/">Dashboard</a>
              <a href="/admin">Admin Panel</a>
            </div>
          </div>
        </nav>
        <div className="container" style={{ paddingBottom: '4rem' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
