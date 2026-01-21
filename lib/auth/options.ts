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
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
                // Extract roles if needed from profile

                // Verify if the user has admin roles (logic can be expanded)
                // For now, we assume successful login via Keycloak (which handles Okta) is sufficient for initial access,
                // or we can decode the token here.
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            if (session.user) {
                (session as any).accessToken = token.accessToken;
            }
            return session;
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
    secret: process.env.NEXTAUTH_SECRET,
};
