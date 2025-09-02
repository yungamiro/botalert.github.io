import React, { useState, useEffect } from 'react';
import { BotAlertDashboard } from './components/BotAlertDashboard';
import { NotificationManager } from './components/NotificationManager';
import './App.css';

interface MonitoringTarget {
  id: string;
  url: string;
  keywords: string[];
  selector?: string;
  name?: string;
  isActive: boolean;
  lastChecked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Alert {
  id: string;
  targetId: string;
  keyword: string;
  matchedText: string;
  url: string;
  timestamp: Date;
  isRead: boolean;
}

function App() {
  const [targets, setTargets] = useState<MonitoringTarget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadInitialData();
    setupNotifications();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([loadTargets(), loadAlerts()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTargets = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/monitoring/targets');
      const data = await response.json();
      if (data.success) {
        setTargets(data.data);
      }
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/monitoring/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const setupNotifications = async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const permission = await Notification.requestPermission();
        setNotificationsEnabled(permission === 'granted');
        
        if (permission === 'granted') {
          // Register service worker and subscribe to push notifications
          await registerServiceWorker();
        }
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const addTarget = async (targetData: {
    url: string;
    keywords: string[];
    selector?: string;
    name?: string;
  }) => {
    try {
      const response = await fetch('http://localhost:3001/api/monitoring/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetData),
      });

      const data = await response.json();
      if (data.success) {
        await loadTargets();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error adding target:', error);
      throw error;
    }
  };

  const updateTarget = async (id: string, updates: Partial<MonitoringTarget>) => {
    try {
      const response = await fetch(`http://localhost:3001/api/monitoring/targets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        await loadTargets();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error updating target:', error);
      throw error;
    }
  };

  const deleteTarget = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/monitoring/targets/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await loadTargets();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error deleting target:', error);
      throw error;
    }
  };

  const markAlertAsRead = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/monitoring/alerts/${id}/read`, {
        method: 'PATCH',
      });

      const data = await response.json();
      if (data.success) {
        await loadAlerts();
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Bot Alert Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V12h-5l5-5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bot Alert</h1>
                <p className="text-sm text-gray-500">Monitor websites for keyword matches</p>
              </div>
            </div>
            <NotificationManager 
              enabled={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BotAlertDashboard
          targets={targets}
          alerts={alerts}
          onAddTarget={addTarget}
          onUpdateTarget={updateTarget}
          onDeleteTarget={deleteTarget}
          onMarkAlertAsRead={markAlertAsRead}
        />
      </main>
    </div>
  );
}

export default App;