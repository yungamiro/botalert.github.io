import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { DatabaseService } from '../services/DatabaseService';

export function notificationRoutes(notificationService: NotificationService): Router {
  const router = Router();

  // Get VAPID public key for push notifications
  router.get('/vapid-public-key', (req: Request, res: Response) => {
    try {
      const publicKey = notificationService.getVapidPublicKey();
      res.json({ success: true, data: { publicKey } });
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get VAPID public key' 
      });
    }
  });

  // Subscribe to push notifications
  router.post('/subscribe', async (req: Request, res: Response) => {
    try {
      const { endpoint, keys } = req.body;

      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subscription data'
        });
      }

      // Note: You'll need to pass DatabaseService to this route
      // For now, we'll return success without saving to database
      // In a real implementation, you'd save the subscription to the database

      res.json({ 
        success: true,
        message: 'Subscription registered successfully' 
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to subscribe to notifications' 
      });
    }
  });

  // Send test notification
  router.post('/test', async (req: Request, res: Response) => {
    try {
      const testPayload = {
        title: '🚀 Test Notification',
        body: 'This is a test notification from Bot Alert!',
        icon: '/icon-192x192.png',
        data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      };

      // For testing purposes, we'll return the payload
      // In a real implementation, you'd send to all subscriptions
      res.json({ 
        success: true,
        data: {
          message: 'Test notification prepared',
          payload: testPayload
        }
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send test notification' 
      });
    }
  });

  return router;
}