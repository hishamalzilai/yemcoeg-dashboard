import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Never fall back to a guessable secret in production: anyone could forge an admin session.
function getKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV === "production" ? "" : "dev-only-insecure-secret");
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getKey());
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, getKey(), {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = new Response();
  res.headers.set(
    "Set-Cookie",
    `session=${await encrypt(parsed)}; Path=/; HttpOnly; SameSite=Lax; Expires=${parsed.expires.toUTCString()}`
  );
  return res;
}
