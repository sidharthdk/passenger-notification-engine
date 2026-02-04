"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Auth callback handler page
 * Ensures proper redirect after Keycloak authentication
 */
export default function AuthCallbackPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            console.log("✅ Authentication successful, redirecting to /admin");
            // Use replace to avoid back button issues
            router.replace("/admin");
        } else if (status === "unauthenticated") {
            console.log("❌ Authentication failed, redirecting to login");
            router.replace("/admin/login");
        }
    }, [status, router]);

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
            <h2>Completing authentication...</h2>
            <p style={{ color: '#94a3b8' }}>Please wait while we verify your session</p>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
