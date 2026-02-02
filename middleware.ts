import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "dbm_admin";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login/logout routes (otherwise we'd create a redirect loop).
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/logout")) {
    return NextResponse.next();
  }

  const password = process.env.ADMIN_PASSWORD;
  const cookieVal = req.cookies.get(COOKIE_NAME)?.value;

  // If not configured, do not expose admin pages.
  if (!password) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url);
  }

  const expected = await sha256Hex(`dbm_admin:${password}`);
  if (cookieVal === expected) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
