import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, imageUrl, published } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        published: published ?? true,
      },
    });
    
    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
