import React, { useState } from 'react';
import { MonitoringTargetForm } from './MonitoringTargetForm';
import { TargetsList } from './TargetsList';
import { AlertsList } from './AlertsList';
import { StatsOverview } from './StatsOverview';

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

interface BotAlertDashboardProps {
  targets: MonitoringTarget[];
  alerts: Alert[];
  onAddTarget: (target: { url: string; keywords: string[]; selector?: string; name?: string }) => Promise<boolean>;
  onUpdateTarget: (id: string, updates: Partial<MonitoringTarget>) => Promise<boolean>;
  onDeleteTarget: (id: string) => Promise<boolean>;
  onMarkAlertAsRead: (id: string) => Promise<boolean>;
}

export const BotAlertDashboard: React.FC<BotAlertDashboardProps> = ({
  targets,
  alerts,
  onAddTarget,
  onUpdateTarget,
  onDeleteTarget,
  onMarkAlertAsRead,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'alerts'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const activeTargets = targets.filter(target => target.isActive);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'targets', name: 'Targets', icon: '🎯', badge: activeTargets.length },
    { id: 'alerts', name: 'Alerts', icon: '🚨', badge: unreadAlerts.length },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm relative
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Add Target Button */}
      {activeTab === 'targets' && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Target
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <StatsOverview 
          totalTargets={targets.length}
          activeTargets={activeTargets.length}
          totalAlerts={alerts.length}
          unreadAlerts={unreadAlerts.length}
        />
      )}

      {activeTab === 'targets' && (
        <TargetsList
          targets={targets}
          onUpdate={onUpdateTarget}
          onDelete={onDeleteTarget}
        />
      )}

      {activeTab === 'alerts' && (
        <AlertsList
          alerts={alerts}
          targets={targets}
          onMarkAsRead={onMarkAlertAsRead}
        />
      )}

      {/* Add Target Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Monitoring Target</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <MonitoringTargetForm
              onSubmit={async (data) => {
                const success = await onAddTarget(data);
                if (success) {
                  setShowAddForm(false);
                }
                return success;
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};