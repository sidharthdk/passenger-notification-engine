import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions: NextAuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
            clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "",
            issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account, profile }) {
            try {
                if (account) {
                    token.accessToken = account.access_token;
                    token.id = profile?.sub;
                }
                return token;
            } catch (error) {
                console.error('JWT callback error:', error);
                throw error;  // Re-throw for NextAuth error page
            }
        },
        async session({ session, token }) {
            try {
                if (session.user) {
                    (session.user as any).id = token.id as string;
                }
                (session as any).accessToken = token.accessToken as string;
                (session as any).error = undefined;
                return session;
            } catch (error) {
                console.error('Session callback error:', error);
                throw error;
            }
        },
        async redirect({ url, baseUrl }) {
            return url.startsWith('/') ? `${baseUrl}${url}` : url;
        },
    },
    debug: true,  // Enable debug temporarily
    logger: {
        error(code, ...message) {
            console.error(code, message);
        },
    },
    events: {
        async signOut({ token, session }) {
            // Handle Keycloak logout if needed (often requires visiting the end_session_endpoint)
        }
    },
    pages: {
        signIn: '/admin/login',
    },
};
