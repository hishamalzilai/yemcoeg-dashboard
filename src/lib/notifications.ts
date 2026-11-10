import { prisma } from '@/lib/prisma';
import { app } from '@/lib/firebase';
import { getMessaging, type MulticastMessage } from 'firebase-admin/messaging';

// FCM accepts at most 500 tokens per multicast request.
const FCM_BATCH_SIZE = 500;

// Errors meaning the token will never work again (app uninstalled, token rotated, malformed).
const DEAD_TOKEN_ERRORS = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/**
 * Tells the app what was sent, so tapping the notification opens the right tab
 * (see NotificationService._tabFor in the Flutter app).
 */
export type PushTarget = 'news' | 'announcement' | 'home';

export type PushResult = {
  success: boolean;
  successCount: number;
  failureCount: number;
  removedTokens: number;
  reason?: string;
};

export async function sendPushNotificationToAll(
  title: string,
  body: string,
  target?: PushTarget,
): Promise<PushResult> {
  const result: PushResult = { success: false, successCount: 0, failureCount: 0, removedTokens: 0 };
  try {
    const tokens = (await prisma.deviceToken.findMany({ select: { token: true } }))
      .map((t) => t.token)
      .filter((t) => t && t.trim().length > 0);

    if (tokens.length === 0) {
      console.log('Push: no devices registered for notifications.');
      return { ...result, reason: 'No devices' };
    }

    const messaging = getMessaging(app);
    const deadTokens: string[] = [];

    for (let i = 0; i < tokens.length; i += FCM_BATCH_SIZE) {
      const batch = tokens.slice(i, i + FCM_BATCH_SIZE);
      const message: MulticastMessage = {
        tokens: batch,
        notification: { title, body },
        ...(target ? { data: { type: target, screen: target } } : {}),
        android: {
          priority: 'high',
          notification: { channelId: 'high_importance_channel', sound: 'default' },
        },
        apns: { payload: { aps: { sound: 'default' } } },
      };

      try {
        const response = await messaging.sendEachForMulticast(message);
        result.successCount += response.successCount;
        result.failureCount += response.failureCount;
        response.responses.forEach((r, idx) => {
          if (!r.success && r.error && DEAD_TOKEN_ERRORS.has(r.error.code)) deadTokens.push(batch[idx]);
        });
      } catch (error) {
        // One failed batch must not stop the others
        result.failureCount += batch.length;
        console.error(`Push: batch ${i / FCM_BATCH_SIZE + 1} failed:`, error);
      }
    }

    if (deadTokens.length > 0) {
      const { count } = await prisma.deviceToken.deleteMany({ where: { token: { in: deadTokens } } });
      result.removedTokens = count;
    }

    result.success = result.successCount > 0;
    console.log(
      `Push: sent ${result.successCount}, failed ${result.failureCount}, removed ${result.removedTokens} dead tokens (of ${tokens.length} devices).`,
    );
    return result;
  } catch (error) {
    console.error('Push: error sending notification:', error);
    return { ...result, reason: 'Error' };
  }
}
