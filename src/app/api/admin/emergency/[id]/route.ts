import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { name, number, type, order } = await request.json();
    const { id } = await params;

    const item = await prisma.emergencyNumber.update({
      where: { id },
      data: {
        name,
        number,
        type,
        order: order ?? 0,
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
    
    await prisma.emergencyNumber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
