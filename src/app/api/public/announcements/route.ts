import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.announcement.findMany({
      where: { active: true },
      orderBy: { priority: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
