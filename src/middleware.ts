import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:;");

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    try {
      const parsed = await decrypt(session);
      if (!parsed) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // API protection
  if (request.nextUrl.pathname.startsWith("/api/admin") && !request.nextUrl.pathname.startsWith("/api/admin/login")) {
    const session = request.cookies.get("session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
      const parsed = await decrypt(session);
      if (!parsed) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
