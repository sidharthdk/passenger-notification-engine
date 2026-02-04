import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const issuer = process.env.KEYCLOAK_ISSUER || "http://localhost:8080/realms/intern-auth-realm";

console.log("Auth Config Loaded:", {
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    issuer: issuer,
    hasSecret: !!process.env.AUTH_KEYCLOAK_SECRET
});

export const authOptions: NextAuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "intern-web-app",
            clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "",
            issuer: issuer,
            authorization: {
                params: {
                    scope: "openid email profile",
                },
            },
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },

    debug: true,

    // pages: {
    //     signIn: '/admin/login',
    //     error: '/admin/login',
    // },

    // trustHost is handled by NEXTAUTH_URL env var or inferred
    // trustHost: true,

    callbacks: {
        async jwt({ token, account, user }: any) {
            console.log("👉 JWT Callback");
            if (account) {
                console.log("👉 JWT: Got Account");
                token.accessToken = account.access_token;
                token.idToken = account.id_token;
                token.provider = account.provider;
            } else {
                console.log("👉 JWT: Existing Token");
            }
            return token;
        },

        async session({ session, token }: any) {
            console.log("👉 Session Callback");
            session.accessToken = token.accessToken;
            session.provider = token.provider;
            session.user = session.user || {};
            // console.log("👉 Session Created for:", session.user?.email);
            return session;
        },

        async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
            console.log("👉 Redirect Callback:", url);
            // Handle relative URLs
            if (url.startsWith("/")) return baseUrl + url;
            // Allow callback URLs
            if (url.startsWith(baseUrl)) return url;
            // Redirect to admin by default
            return baseUrl + "/admin";
        },

        async signIn({ user, account, profile }: any) {
            console.log("👉 SignIn Callback");
            console.log("👉 Full Profile:", JSON.stringify(profile, null, 2));
            console.log("👉 Full Account:", JSON.stringify(account, null, 2));
            return true;
        },
    },
};
