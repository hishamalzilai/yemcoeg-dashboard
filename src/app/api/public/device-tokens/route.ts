import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { token, deviceOs } = data;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Upsert the token
    const deviceToken = await prisma.deviceToken.upsert({
      where: { token },
      update: { deviceOs },
      create: { token, deviceOs },
    });

    return NextResponse.json({ success: true, deviceToken }, { status: 201 });
  } catch (error) {
    console.error('Error saving device token:', error);
    return NextResponse.json(
      { error: 'Failed to save device token' },
      { status: 500 }
    );
  }
}
