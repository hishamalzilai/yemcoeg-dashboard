import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteImages } from "@/lib/r2";

const PAGE_SIZE = 20;
const STATUSES = ["pending", "processing", "completed", "rejected"] as const;

// Must match the value sent by the "delete all" dialog in aid-requests/page.tsx
const WIPE_CONFIRMATION = "DELETE_ALL_AID_REQUESTS";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const pageParam = searchParams.get("page");

    const searchWhere: Prisma.AidRequestWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search } },
            { phone: { contains: search } },
            { transactionId: { contains: search } },
          ],
        }
      : {};
    const where: Prisma.AidRequestWhereInput = status ? { ...searchWhere, status } : searchWhere;

    // Without ?page= return the full list (used by the header badge and the Excel export)
    if (!pageParam) {
      const forms = await prisma.aidRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(forms);
    }

    const total = await prisma.aidRequest.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(1, parseInt(pageParam, 10) || 1), totalPages);

    const [items, grouped] = await Promise.all([
      prisma.aidRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      // Tab counts follow the search but ignore the selected status tab
      prisma.aidRequest.groupBy({ by: ["status"], where: searchWhere, _count: { _all: true } }),
    ]);

    const counts: Record<string, number> = { all: 0 };
    for (const s of STATUSES) counts[s] = 0;
    for (const g of grouped) {
      counts[g.status] = g._count._all;
      counts.all += g._count._all;
    }

    return NextResponse.json({ items, total, page, pageSize: PAGE_SIZE, totalPages, counts });
  } catch (error) {
    console.error("Error listing aid requests:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Permanently delete ALL aid requests and their uploaded images.
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body?.confirm !== WIPE_CONFIRMATION) {
      return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
    }

    const all = await prisma.aidRequest.findMany({ select: { images: true } });
    const imageUrls: string[] = [];
    for (const r of all) {
      try {
        const parsed = JSON.parse(r.images);
        if (Array.isArray(parsed)) imageUrls.push(...parsed.filter((u) => typeof u === "string"));
      } catch {
        // ignore malformed image lists
      }
    }

    const { count } = await prisma.aidRequest.deleteMany({});
    const imagesDeleted = await deleteImages(imageUrls);

    console.log(`Wiped ${count} aid requests and ${imagesDeleted}/${imageUrls.length} images`);
    return NextResponse.json({ success: true, deleted: count, imagesDeleted, imagesTotal: imageUrls.length });
  } catch (error) {
    console.error("Error wiping aid requests:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
