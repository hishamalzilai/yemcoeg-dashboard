import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
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
