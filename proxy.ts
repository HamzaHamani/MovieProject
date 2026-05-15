import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const isAuthenticated = Boolean(req.auth?.user);
  const username = req.auth?.user?.username;
  const pathname = req.nextUrl.pathname;

  const isAuthApiRoute = pathname.startsWith("/api/auth");
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public");

  if (!isAuthenticated || isAuthApiRoute || isPublicAsset) {
    return NextResponse.next();
  }

  const hasUsername =
    typeof username === "string" && username.trim().length > 0;

  if (!hasUsername) {
    const redirectUrl = new URL("/explore?setupUsername=1", req.nextUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
