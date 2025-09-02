import webpush from 'web-push';
import { NotificationPayload, PushSubscription } from '../types';

export class NotificationService {
  constructor() {
    // Generate VAPID keys if not provided
    const vapidKeys = webpush.generateVAPIDKeys();
    
    webpush.setVapidDetails(
      'mailto:admin@bot-alert.local',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );
  }

  getVapidPublicKey(): string {
    return process.env.VAPID_PUBLIC_KEY || 'BK8JQKv8yS4VdYw2wJ_-2dJ-zKQDj6-F-uJ7_-b_a_FH3HZJmQ5ZYz-4qO4nQ_Xz-v-5Ft5aHfA_QG-3jg-GGQ';
  }

  async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      };

      const result = await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );

      console.log('Push notification sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  async sendToAllSubscriptions(
    subscriptions: PushSubscription[],
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    const results = await Promise.allSettled(
      subscriptions.map(sub => this.sendNotification(sub, payload))
    );

    const sent = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - sent;

    return { sent, failed };
  }

  createAlertNotification(
    keyword: string,
    url: string,
    matchedText: string
  ): NotificationPayload {
    return {
      title: `🚨 Alert: "${keyword}" found!`,
      body: `Found: "${matchedText.substring(0, 100)}..." on ${new URL(url).hostname}`,
      icon: '/icon-192x192.png',
      url: url,
      data: {
        keyword,
        url,
        matchedText,
        timestamp: new Date().toISOString()
      }
    };
  }
}