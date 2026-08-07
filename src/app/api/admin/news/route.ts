import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotificationToAll } from "@/lib/notifications";

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

    if (news.published) {
      // Send notification in background
      sendPushNotificationToAll("خبر جديد 📰", news.title);

      // Trigger n8n webhook for WhatsApp news broadcast
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        console.log(`Sending n8n webhook for news to: ${n8nUrl}/news`);
        fetch(n8nUrl + "/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: news.title,
            content: news.content,
            imageUrl: news.imageUrl
          }),
        }).catch(err => console.error("N8n error:", err));
      }
    }
    
    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
