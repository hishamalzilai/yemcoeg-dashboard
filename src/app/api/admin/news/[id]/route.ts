import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { title, content, imageUrl, published } = await request.json();
    const { id } = await params;

    const news = await prisma.news.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        published: published ?? true,
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.news.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
