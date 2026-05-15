import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isAuthenticated = Boolean(req.auth?.user);
  const username = req.auth?.user?.username;

  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public");
  const isPublicPage = 
    pathname === "/" ||
    pathname === "/explore" ||
    pathname === "/sign-in" ||
    pathname.startsWith("/movie/") ||
    pathname.startsWith("/tv/") ||
    pathname.startsWith("/crew/") ||
    pathname.startsWith("/profile/");

  // Public assets and auth routes pass through
  if (isAuthApiRoute || isPublicAsset || !isAuthenticated || isPublicPage) {
    return NextResponse.next();
  }

  // For authenticated users on protected routes, check username
  const hasUsername = typeof username === "string" && username.trim().length > 0;
  if (!hasUsername) {
    const redirectUrl = new URL("/explore", req.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
