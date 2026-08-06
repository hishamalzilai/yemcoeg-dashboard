import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
    });

    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: session.adminId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
