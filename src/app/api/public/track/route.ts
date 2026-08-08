import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { trackingId } = await request.json();

    if (!trackingId) {
      return NextResponse.json(
        { error: "رقم التتبع مطلوب" },
        { status: 400 }
      );
    }

    // Find the aid request using either the explicit transactionId or the internal UUID prefix
    const aidRequest = await prisma.aidRequest.findFirst({
      where: {
        OR: [
          { transactionId: trackingId },
          { id: { startsWith: trackingId.toLowerCase() } }
        ]
      },
      select: {
        id: true,
        transactionId: true,
        fullName: true,
        aidType: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!aidRequest) {
      return NextResponse.json(
        { error: "لم يتم العثور على طلب مطابق. يرجى التأكد من رقم التتبع ورقم الهوية." },
        { status: 404 }
      );
    }

    // Map aid types to arabic for the frontend
    const aidTypeMap: Record<string, string> = {
      food: "مساعدات غذائية",
      money: "مساعدات مالية",
      housing: "سكن",
      medical: "مساعدات طبية",
      other: "أخرى"
    };

    const statusMap: Record<string, string> = {
      pending: "قيد المراجعة",
      processing: "جاري المعالجة",
      completed: "مكتمل",
      rejected: "مرفوض"
    };

    return NextResponse.json({
      success: true,
      request: {
        trackingId: aidRequest.transactionId || aidRequest.id.split('-')[0].toUpperCase(),
        fullName: aidRequest.fullName,
        aidType: aidTypeMap[aidRequest.aidType] || aidRequest.aidType,
        status: aidRequest.status,
        statusText: statusMap[aidRequest.status] || aidRequest.status,
        notes: aidRequest.notes,
        createdAt: aidRequest.createdAt,
        updatedAt: aidRequest.updatedAt,
      }
    });
  } catch (error) {
    console.error("Error tracking request:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
