import React, { useState } from 'react';

interface Alert {
  id: string;
  targetId: string;
  keyword: string;
  matchedText: string;
  url: string;
  timestamp: Date;
  isRead: boolean;
}

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

interface AlertsListProps {
  alerts: Alert[];
  targets: MonitoringTarget[];
  onMarkAsRead: (id: string) => Promise<boolean>;
}

export const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  targets,
  onMarkAsRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getTargetName = (targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    return target?.name || (target ? new URL(target.url).hostname : 'Unknown');
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || (filter === 'unread' && !alert.isRead)
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const markAsRead = async (alert: Alert) => {
    if (!alert.isRead) {
      await onMarkAsRead(alert.id);
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V12h-5l5-5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts yet</h3>
        <p className="mt-1 text-sm text-gray-500">When your monitoring targets find keyword matches, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            filter === 'unread'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Unread ({alerts.filter(a => !a.isRead).length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-lg shadow border-l-4 ${
              alert.isRead ? 'border-gray-200' : 'border-red-400'
            } hover:shadow-md transition-shadow cursor-pointer`}
            onClick={() => markAsRead(alert)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🚨</span>
                    <h3 className="text-sm font-medium text-gray-900">
                      Keyword "{alert.keyword}" found
                    </h3>
                    {!alert.isRead && (
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    On: <span className="font-medium">{getTargetName(alert.targetId)}</span>
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-800">
                      "{alert.matchedText.length > 200 
                        ? alert.matchedText.substring(0, 200) + '...' 
                        : alert.matchedText}"
                    </p>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatDate(alert.timestamp)}</span>
                    <a
                      href={alert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Source →
                    </a>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(alert);
                    }}
                    className={`p-2 rounded-full ${
                      alert.isRead
                        ? 'text-gray-400'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    title={alert.isRead ? 'Already read' : 'Mark as read'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && filter === 'unread' && (
        <div className="text-center py-8">
          <p className="text-gray-500">No unread alerts</p>
        </div>
      )}
    </div>
  );
};