import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONTACT_INFO_ID, CONTACT_TEXT_FIELDS, getContactInfo } from "@/lib/contact-info";

export async function GET() {
  try {
    return NextResponse.json(await getContactInfo());
  } catch (error) {
    console.error("Error loading contact info:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const isUrl = (v: string) => /^https?:\/\/\S+$/i.test(v);

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await getContactInfo(); // makes sure the table and row exist

    const data: Record<string, string | number> = {};
    for (const field of CONTACT_TEXT_FIELDS) {
      const value = body[field];
      if (value === undefined) continue;
      if (typeof value !== "string" || value.length > 1000) {
        return NextResponse.json({ error: `قيمة غير صالحة: ${field}` }, { status: 400 });
      }
      data[field] = value.trim();
    }

    for (const field of ["facebookUrl", "instagramUrl", "xUrl", "mapUrl"] as const) {
      const v = data[field];
      if (typeof v === "string" && v && !isUrl(v)) {
        return NextResponse.json({ error: "الروابط يجب أن تبدأ بـ https://" }, { status: 400 });
      }
    }
    if (typeof data.email === "string" && data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
    }

    for (const [field, min, max] of [["latitude", -90, 90], ["longitude", -180, 180]] as const) {
      if (body[field] === undefined) continue;
      const n = Number(body[field]);
      if (!Number.isFinite(n) || n < min || n > max) {
        return NextResponse.json({ error: "الإحداثيات غير صحيحة" }, { status: 400 });
      }
      data[field] = n;
    }

    const updated = await prisma.contactInfo.update({ where: { id: CONTACT_INFO_ID }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error saving contact info:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
