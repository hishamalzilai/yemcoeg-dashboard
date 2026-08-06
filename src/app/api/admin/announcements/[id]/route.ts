import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { title, content, active, priority } = await request.json();
    const { id } = await params;

    const item = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        active: active ?? true,
        priority: priority ?? 0,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
