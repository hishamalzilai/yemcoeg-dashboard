import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotificationToAll } from "@/lib/notifications";

export async function GET() {
  try {
    const items = await prisma.announcement.findMany({
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, imageUrl, active, priority } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const item = await prisma.announcement.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        active: active ?? true,
        priority: priority ?? 0,
      },
    });

    if (item.active) {
      // Send notification in background
      sendPushNotificationToAll("إعلان هام 📢", item.title);
    }
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
