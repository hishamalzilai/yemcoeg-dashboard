import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccess } from "@/lib/roles";

/**
 * The admin's current role, read from the database on every request: deleting an
 * account or changing its role takes effect at once, not when the 24h session expires.
 */
async function currentRole(request: NextRequest): Promise<string | null> {
  const session = request.cookies.get("session")?.value;
  if (!session) return null;
  try {
    const parsed = await decrypt(session);
    if (!parsed?.adminId) return null;
    const admin = await prisma.admin.findUnique({
      where: { id: parsed.adminId },
      select: { role: true },
    });
    return admin?.role ?? null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", "default-src 'self' https: 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:;");

  const { pathname } = request.nextUrl;

  // Protect /admin pages
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const role = await currentRole(request);
    if (!role) return NextResponse.redirect(new URL("/admin/login", request.url));
    if (!canAccess(pathname, request.method, role)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Protect the admin API
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")) {
    const role = await currentRole(request);
    if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canAccess(pathname, request.method, role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
