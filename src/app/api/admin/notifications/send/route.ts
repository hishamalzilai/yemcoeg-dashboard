import { NextResponse } from 'next/server';
import { sendPushNotificationToAll } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const { title, body } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // Manual messages open the app on the home tab when tapped
    const result = await sendPushNotificationToAll(title, body, 'home');

    if (result.reason === 'No devices') {
      return NextResponse.json({ error: 'No devices registered for notifications' }, { status: 400 });
    }
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send notification', details: `${result.failureCount} devices failed` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        successCount: result.successCount,
        failureCount: result.failureCount,
        removedTokens: result.removedTokens,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
