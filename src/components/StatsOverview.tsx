import React from 'react';

interface StatsOverviewProps {
  totalTargets: number;
  activeTargets: number;
  totalAlerts: number;
  unreadAlerts: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalTargets,
  activeTargets,
  totalAlerts,
  unreadAlerts,
}) => {
  const stats = [
    {
      name: 'Total Targets',
      value: totalTargets,
      icon: '🎯',
      color: 'bg-blue-50 text-blue-600',
      description: 'Websites being monitored',
    },
    {
      name: 'Active Targets',
      value: activeTargets,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
      description: 'Currently monitoring',
    },
    {
      name: 'Total Alerts',
      value: totalAlerts,
      icon: '🚨',
      color: 'bg-purple-50 text-purple-600',
      description: 'All-time alerts generated',
    },
    {
      name: 'Unread Alerts',
      value: unreadAlerts,
      icon: '🔔',
      color: 'bg-red-50 text-red-600',
      description: 'Require your attention',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md ${stat.color} flex items-center justify-center`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            🚀 Quick Start Guide
          </h3>
          <div className="prose prose-sm text-gray-600">
            <ol className="list-decimal list-inside space-y-2">
              <li>Click on the <strong>Targets</strong> tab and add your first monitoring target</li>
              <li>Enter the website URL you want to monitor (e.g., job boards, e-commerce sites)</li>
              <li>Add keywords to search for (e.g., "fullstack developer", "product available")</li>
              <li>Optionally, specify a CSS selector to target specific page sections</li>
              <li>Enable browser notifications to get real-time alerts</li>
              <li>Check the <strong>Alerts</strong> tab to see your keyword matches</li>
            </ol>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            📊 System Status
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Online</div>
              <div className="text-sm text-gray-500">Monitoring Service</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">5min</div>
              <div className="text-sm text-gray-500">Check Interval</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      {totalTargets === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400 text-xl">💡</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Pro Tips for Better Monitoring
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use specific keywords to reduce false positives</li>
                  <li>Add CSS selectors to focus on relevant page sections</li>
                  <li>Test your targets with common job boards or shopping sites</li>
                  <li>Enable browser notifications for instant alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};