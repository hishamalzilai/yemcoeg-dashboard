import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isRole } from "@/lib/roles";
import { ADMIN_PUBLIC_FIELDS, cleanName, passwordProblem } from "@/lib/admin-users";

// Access is limited to the super admin by src/proxy.ts.

type Context = { params: Promise<{ id: string }> };

const superAdminCount = () => prisma.admin.count({ where: { role: "superadmin" } });

export async function PUT(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await request.json();

    const target = await prisma.admin.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });

    const data: { name?: string; role?: string; password?: string } = {};

    if (body.name !== undefined) {
      const name = cleanName(body.name);
      if (!name) return NextResponse.json({ error: "الاسم غير صحيح" }, { status: 400 });
      data.name = name;
    }

    if (body.role !== undefined && body.role !== target.role) {
      if (!isRole(body.role)) return NextResponse.json({ error: "الدور غير صحيح" }, { status: 400 });
      if (id === session?.adminId) {
        return NextResponse.json({ error: "لا يمكنك تغيير صلاحيات حسابك" }, { status: 400 });
      }
      if (target.role === "superadmin" && (await superAdminCount()) <= 1) {
        return NextResponse.json({ error: "يجب أن يبقى مدير عام واحد على الأقل" }, { status: 400 });
      }
      data.role = body.role;
    }

    if (body.password) {
      const problem = passwordProblem(body.password);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
      data.password = await bcrypt.hash(body.password, 12);
    }

    const user = await prisma.admin.update({ where: { id }, data, select: ADMIN_PUBLIC_FIELDS });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (id === session?.adminId) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك" }, { status: 400 });
    }
    const target = await prisma.admin.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    if (target.role === "superadmin" && (await superAdminCount()) <= 1) {
      return NextResponse.json({ error: "يجب أن يبقى مدير عام واحد على الأقل" }, { status: 400 });
    }

    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
