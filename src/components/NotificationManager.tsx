import React, { useState } from 'react';

interface NotificationManagerProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  enabled,
  onToggle,
}) => {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleToggleNotifications = async () => {
    if (!enabled) {
      setIsSubscribing(true);
      try {
        // Request notification permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Register service worker and subscribe to push notifications
          if ('serviceWorker' in navigator && 'PushManager' in window) {
            const registration = await navigator.serviceWorker.register('/sw.js');
            
            // Get VAPID public key from backend
            const response = await fetch('http://localhost:3001/api/notifications/vapid-public-key');
            const data = await response.json();
            
            if (data.success) {
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: data.data.publicKey,
              });

              // Send subscription to backend
              await fetch('http://localhost:3001/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
                    auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
                  },
                }),
              });

              onToggle(true);
            }
          }
        } else {
          alert('Notifications permission denied. Please enable notifications in your browser settings.');
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        alert('Failed to set up notifications. Please try again.');
      } finally {
        setIsSubscribing(false);
      }
    } else {
      // Disable notifications
      onToggle(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/notifications/test', {
        method: 'POST',
      });
      
      const data = await response.json();
      if (data.success) {
        // Also show a browser notification for immediate feedback
        if (enabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🚀 Test Notification', {
            body: 'This is a test notification from Bot Alert!',
            icon: '/favicon.ico',
          });
        }
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {enabled && (
        <button
          onClick={sendTestNotification}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Test Notification
        </button>
      )}
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Notifications</span>
        <button
          onClick={handleToggleNotifications}
          disabled={isSubscribing}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          } ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-400' : 'bg-gray-400'}`} />
        <span className="text-xs text-gray-500">
          {enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );
};