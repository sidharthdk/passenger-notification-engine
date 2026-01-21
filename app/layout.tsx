import './globals.css';
import type { Metadata } from 'next';
import { Plane } from 'lucide-react';

export const metadata: Metadata = {
  title: 'South Indian Airways | Notification Engine',
  description: 'Flight Status & Notifications',
};

import { cookies } from 'next/headers';
import { AuthProvider } from './providers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.has('admin_token');
  // const isPassenger = cookieStore.has('passenger_token');

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav className="navbar">
            <div className="container nav-content">
              <a href="/" className="logo">
                <Plane className="w-6 h-6" /> South Indian Airways
              </a>
              <div className="nav-links">
                <a href="/">Home</a>
                {/* Only show Admin Panel if logged in as Admin */}
                {isAdmin && <a href="/admin">Admin Panel</a>}
                {isAdmin && <a href="/monitor">Monitor</a>}
                {/* Force logout logic/button could be here too */}
              </div>
            </div>
          </nav>
          <main className="container" style={{ minHeight: '80vh' }}>
            {children}
          </main>
          <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <div className="container">
              &copy; {new Date().getFullYear()} South Indian Airways. All rights reserved.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
