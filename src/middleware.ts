import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/produtos",
  "/leads",
  "/perfil",
  "/admin",
];

const TOKEN_COOKIE = "cmeloflow_token";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const requiresAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!requiresAuth) return NextResponse.next();

  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/produtos/:path*",
    "/leads/:path*",
    "/perfil/:path*",
    "/admin/:path*",
  ],
};
