import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { app } from '@/lib/firebase';
import { getMessaging } from 'firebase-admin/messaging';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, body } = data;

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    const deviceTokens = await prisma.deviceToken.findMany();
    // Filter out any empty or invalid tokens
    const tokens = deviceTokens
      .map(t => t.token)
      .filter(t => t && t.trim().length > 0);

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'No devices registered for notifications' }, { status: 400 });
    }

    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    const messaging = getMessaging(app);
    const response = await messaging.sendEachForMulticast(message);
    
    return NextResponse.json({ 
      success: true, 
      successCount: response.successCount,
      failureCount: response.failureCount 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message || String(error), stack: error.stack },
      { status: 500 }
    );
  }
}
