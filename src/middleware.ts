import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (!token && !req.nextUrl.pathname.startsWith("/auth/login"))
      return NextResponse.redirect(new URL("/auth/login", req.url));

    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/auth/login")) {
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (token && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({}) => true,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/auth/login"],
};
