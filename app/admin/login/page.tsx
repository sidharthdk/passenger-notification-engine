"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLogin() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. If authenticated, redirect to admin
        if (status === "authenticated") {
            sessionStorage.removeItem('auth_retry_count'); // Clear counter on success
            router.replace("/admin");
            return;
        }

        // 2. If valid auth error, stop and show UI
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(`Authentication failed: ${errorParam}`);
            setIsSigningIn(false);
            return;
        }

        // 3. If unauthenticated and no error, CHECK LOOP GUARD before redirecting
        if (status === "unauthenticated") {
            const retryCount = parseInt(sessionStorage.getItem('auth_retry_count') || '0');

            if (retryCount < 2) { // Allow 1 automatic retry
                console.log(`✈️ Auto-redirecting to Keycloak (Attempt ${retryCount + 1})...`);
                sessionStorage.setItem('auth_retry_count', (retryCount + 1).toString());
                setIsSigningIn(true);
                signIn("keycloak", { callbackUrl: "/admin" });
            } else {
                console.warn("🛑 Redirect loop detected. Stopping auto-redirect.");
                setIsSigningIn(false);
                // Optional: Show a message saying "Auto-login failed, please try manually"
                setError("Auto-login loop detected. Please try signing in manually.");
            }
        }
    }, [status, router, searchParams]);

    const handleSignIn = () => {
        // Manual retry button
        sessionStorage.removeItem('auth_retry_count'); // Reset counter for manual attempt
        setIsSigningIn(true);
        setError(null);
        signIn("keycloak", { callbackUrl: "/admin" });
    };

    if (status === "loading" || isSigningIn) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0f172a',
                color: 'white',
                gap: '1rem'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p>{isSigningIn ? 'Redirecting to Keycloak...' : 'Checking session...'}</p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
            color: 'white',
            gap: '1.5rem'
        }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Access Restricted</h1>
            <p style={{ color: '#94a3b8' }}>Please log in to continue</p>

            {error && (
                <div style={{
                    background: '#991b1b',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                style={{
                    padding: '12px 24px',
                    background: isSigningIn ? '#64748b' : 'white',
                    color: 'black',
                    borderRadius: '8px',
                    cursor: isSigningIn ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    border: 'none',
                    transition: 'all 0.2s',
                    minWidth: '200px'
                }}
            >
                {isSigningIn ? 'Redirecting...' : 'Sign In with Keycloak'}
            </button>

            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '1rem' }}>
                You will be redirected to Keycloak for authentication
            </p>
        </div>
    );
}
