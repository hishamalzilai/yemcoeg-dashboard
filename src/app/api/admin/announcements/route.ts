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

      // Trigger n8n webhook for WhatsApp announcement
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        console.log(`Sending n8n webhook for announcement to: ${n8nUrl}/announcement`);
        fetch(n8nUrl + "/announcement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: item.title,
            content: item.content,
            priority: item.priority,
            imageUrl: item.imageUrl
          }),
        }).catch(err => console.error("N8n error:", err));
      }
    }
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
