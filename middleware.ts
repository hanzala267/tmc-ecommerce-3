import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(
          new URL("/auth/login?callbackUrl=" + pathname, req.url)
        );
      }
    }

    // Business dashboard routes
    if (pathname.startsWith("/business/dashboard")) {
      if (!token || token.role !== "BUSINESS") {
        return NextResponse.redirect(
          new URL("/auth/login?callbackUrl=" + pathname, req.url)
        );
      }
      if (token.businessStatus !== "APPROVED") {
        return NextResponse.redirect(new URL("/business/dashboard", req.url));
      }
    }

    // Protected routes that require authentication
    if (
      pathname.startsWith("/cart") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/orders") ||
      pathname.startsWith("/profile")
    ) {
      if (!token) {
        return NextResponse.redirect(
          new URL("/auth/login?callbackUrl=" + pathname, req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (
          pathname.startsWith("/auth") ||
          pathname.startsWith("/api/auth") ||
          pathname === "/" ||
          pathname.startsWith("/products") ||
          pathname.startsWith("/about") ||
          pathname.startsWith("/contact") ||
          pathname.startsWith("/business/register") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/api/products") ||
          pathname.startsWith("/api/categories") ||
          pathname.startsWith("/api/reviews") ||
          pathname.startsWith("/api/contact")
        ) {
          return true;
        }

        // For protected routes, check if user is authenticated
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/business/dashboard/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/admin/:path*",
  ],
};
