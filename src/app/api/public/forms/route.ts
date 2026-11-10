import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/r2";
import { sendAidConfirmation } from "@/lib/whatsapp";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`forms:${clientIp(request)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "محاولات كثيرة. يرجى المحاولة لاحقاً." }, { status: 429 });
    }

    const formData = await request.formData();
    
    const transactionId = formData.get("transactionId") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const idNumber = formData.get("idNumber") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const aidType = formData.get("aidType") as string;
    const description = formData.get("description") as string;
    
    if (!fullName || !phone || !idNumber || !city || !address || !aidType) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [];
    
    for (const file of imageFiles) {
      const url = await uploadImage(file);
      if (url) imageUrls.push(url);
    }
    
    const aidRequest = await prisma.aidRequest.create({
      data: {
        transactionId: transactionId || null,
        fullName, phone, idNumber, city, address, aidType, description,
        images: JSON.stringify(imageUrls),
        // Confirmation is sent right below; this stops the background notifier from sending it again
        whatsappSent: true,
      },
    });
    
    const requestId = aidRequest.transactionId || aidRequest.id.split('-')[0].toUpperCase();

    // WhatsApp confirmation (never fails the request)
    await sendAidConfirmation(phone, fullName, requestId);
    
    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
