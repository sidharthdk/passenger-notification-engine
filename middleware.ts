import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/admin/login",
    },
});

export const config = {
    // matcher: ["/admin/:path*", "/dashboard/:path*", "/ops/:path*"],
    matcher: [] // Disable middleware temporarily
};
