import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    
    let where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    
    const forms = await prisma.aidRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(forms);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
