import { prisma } from '@/lib/prisma';
import { app } from '@/lib/firebase';
import { getMessaging } from 'firebase-admin/messaging';

export async function sendPushNotificationToAll(title: string, body: string) {
  try {
    const deviceTokens = await prisma.deviceToken.findMany();
    // Filter out any empty or invalid tokens
    const tokens = deviceTokens
      .map(t => t.token)
      .filter(t => t && t.trim().length > 0);

    if (tokens.length === 0) {
      console.log('No devices registered for notifications.');
      return { success: false, reason: 'No devices' };
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
    
    console.log(`Successfully sent ${response.successCount} messages; ${response.failureCount} failed.`);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}
