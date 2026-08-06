import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.emergencyNumber.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items, {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
