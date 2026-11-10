import { NextResponse } from "next/server";
import { signedAttachmentUrl } from "@/lib/supabase-storage";

// Opens a private aid-request attachment for a logged-in admin (src/proxy.ts enforces the role).
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url") ?? "";
  const signed = await signedAttachmentUrl(url);
  if (!signed) {
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }
  return NextResponse.redirect(signed, {
    status: 302,
    headers: { "Cache-Control": "private, no-store" },
  });
}
