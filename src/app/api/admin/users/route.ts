import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isRole } from "@/lib/roles";
import { ADMIN_PUBLIC_FIELDS, cleanEmail, cleanName, passwordProblem } from "@/lib/admin-users";

// Access is limited to the super admin by src/proxy.ts.

export async function GET() {
  try {
    const session = await getSession();
    const users = await prisma.admin.findMany({
      select: ADMIN_PUBLIC_FIELDS,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ users, currentId: session?.adminId ?? null });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = cleanName(body.name);
    const email = cleanEmail(body.email);
    if (!name) return NextResponse.json({ error: "الاسم غير صحيح" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "البريد الإلكتروني غير صحيح" }, { status: 400 });
    if (!isRole(body.role)) return NextResponse.json({ error: "الدور غير صحيح" }, { status: 400 });
    const problem = passwordProblem(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const existing = await prisma.admin.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "هذا البريد مستخدم بالفعل" }, { status: 409 });
    }

    const user = await prisma.admin.create({
      data: { name, email, role: body.role, password: await bcrypt.hash(body.password, 12) },
      select: ADMIN_PUBLIC_FIELDS,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
