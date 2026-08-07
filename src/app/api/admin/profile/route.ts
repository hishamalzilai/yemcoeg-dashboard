import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: { email: true, name: true, role: true }
    });
    
    return NextResponse.json(admin);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, email } = await request.json();

    const admin = await prisma.admin.update({
      where: { id: session.adminId },
      data: { name, email },
      select: { email: true, name: true }
    });

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
