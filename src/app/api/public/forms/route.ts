import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/r2";

export async function POST(request: Request) {
  try {
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
      },
    });
    
    // Trigger n8n webhook
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      console.log(`Sending n8n webhook to: ${n8nUrl}/new-aid-request`);
      try {
        await fetch(n8nUrl + "/new-aid-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, name: fullName, requestId: aidRequest.transactionId || aidRequest.id.split('-')[0].toUpperCase() }),
        });
        console.log("n8n webhook sent successfully");
      } catch (err) {
        console.error("N8n error:", err);
      }
    } else {
      console.log("N8N_WEBHOOK_URL is not set in environment variables");
    }
    
    return NextResponse.json({ success: true, requestId: aidRequest.transactionId || aidRequest.id.split('-')[0].toUpperCase() });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
