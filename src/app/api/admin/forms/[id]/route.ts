import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp, statusUpdateMessage } from "@/lib/whatsapp";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status, notes } = await request.json();
    const { id } = await params;
    
    const updated = await prisma.aidRequest.update({
      where: { id },
      data: { status, notes },
    });
    
    // WhatsApp status notification (never fails the request)
    const requestId = updated.transactionId || updated.id.split('-')[0].toUpperCase();
    await sendWhatsApp(updated.phone, statusUpdateMessage(updated.fullName, requestId, updated.status, updated.notes));
    
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
