import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.emergencyNumber.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, number, type, order } = await request.json();
    
    if (!name || !number || !type) {
      return NextResponse.json({ error: "Name, number and type are required" }, { status: 400 });
    }

    const item = await prisma.emergencyNumber.create({
      data: {
        name,
        number,
        type,
        order: order ?? 0,
      },
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
