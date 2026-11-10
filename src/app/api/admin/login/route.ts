import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { DEFAULT_ADMIN_PASSWORD } from "@/lib/security-setup";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const admin = await prisma.admin.findFirst({
      where: { email: { equals: String(email).trim(), mode: "insensitive" } },
    });

    if (!admin) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    // This password is published in the project's history, so it must never grant access.
    if (password === DEFAULT_ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "كلمة المرور الافتراضية لم تعد مسموحة. اضبط ADMIN_NEW_PASSWORD في إعدادات السيرفر ثم أعد النشر." },
        { status: 403 },
      );
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ adminId: admin.id, email: admin.email, name: admin.name, role: admin.role, expires });

    const response = NextResponse.json({ success: true });
    response.headers.set(
      "Set-Cookie",
      `session=${session}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires.toUTCString()}`
    );

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}
