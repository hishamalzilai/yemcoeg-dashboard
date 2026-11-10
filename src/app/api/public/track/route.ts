import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const NOT_FOUND = "لم يتم العثور على طلب مطابق. يرجى التأكد من رقم التتبع ورقم الهوية.";

// Placeholder the app stores when no passport number was entered: never valid as proof.
const NO_ID_NUMBER = "غير محدد";

const normalize = (v: string) => v.trim().toLowerCase();

export async function POST(request: Request) {
  try {
    if (!rateLimit(`track:${clientIp(request)}`, 10, 10 * 60_000)) {
      return NextResponse.json(
        { error: "محاولات كثيرة. يرجى المحاولة بعد بضع دقائق." },
        { status: 429 },
      );
    }

    const { trackingId, idNumber } = await request.json();

    if (typeof trackingId !== "string" || typeof idNumber !== "string" || !trackingId.trim() || !idNumber.trim()) {
      return NextResponse.json({ error: "رقم التتبع ورقم الهوية مطلوبان" }, { status: 400 });
    }

    const id = trackingId.trim();
    if (!/^[A-Za-z0-9]{4,20}$/.test(id)) {
      return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
    }

    // Exact transaction number, or the full 8-character reference for requests without one
    const aidRequest = await prisma.aidRequest.findFirst({
      where: {
        OR: [
          { transactionId: id },
          ...(/^[0-9a-fA-F]{8}$/.test(id) ? [{ id: { startsWith: `${id.toLowerCase()}-` } }] : []),
        ],
      },
      select: {
        id: true,
        transactionId: true,
        fullName: true,
        idNumber: true,
        aidType: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Same response for "no such request" and "wrong ID number", so neither can be probed
    if (
      !aidRequest ||
      aidRequest.idNumber.trim() === NO_ID_NUMBER ||
      normalize(aidRequest.idNumber) !== normalize(idNumber)
    ) {
      return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
    }

    // Map aid types to arabic for the frontend
    const aidTypeMap: Record<string, string> = {
      food: "مساعدات غذائية",
      money: "مساعدات مالية",
      housing: "سكن",
      medical: "مساعدات طبية",
      other: "أخرى",
    };

    const statusMap: Record<string, string> = {
      pending: "قيد المراجعة",
      processing: "جاري المعالجة",
      completed: "مكتمل",
      rejected: "مرفوض",
    };

    return NextResponse.json({
      success: true,
      request: {
        trackingId: aidRequest.transactionId || aidRequest.id.split("-")[0].toUpperCase(),
        fullName: aidRequest.fullName,
        aidType: aidTypeMap[aidRequest.aidType] || aidRequest.aidType,
        status: aidRequest.status,
        statusText: statusMap[aidRequest.status] || aidRequest.status,
        notes: aidRequest.notes,
        createdAt: aidRequest.createdAt,
        updatedAt: aidRequest.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error tracking request:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
