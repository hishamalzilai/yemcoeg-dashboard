import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status, notes } = await request.json();
    const { id } = await params;
    
    const updated = await prisma.aidRequest.update({
      where: { id },
      data: { status, notes },
    });
    
    // Trigger n8n webhook for status update
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      console.log(`Sending n8n webhook to: ${n8nUrl}/status-update`);
      try {
        await fetch(n8nUrl + "/status-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            phone: updated.phone, 
            name: updated.fullName, 
            requestId: updated.transactionId || updated.id.split('-')[0].toUpperCase(),
            status,
            notes
          }),
        });
        console.log("n8n webhook sent successfully");
      } catch (err) {
        console.error("N8n error:", err);
      }
    } else {
      console.log("N8N_WEBHOOK_URL is not set in environment variables");
    }
    
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
