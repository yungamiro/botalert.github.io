import React, { useState } from 'react';

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

interface TargetsListProps {
  targets: MonitoringTarget[];
  onUpdate: (id: string, updates: Partial<MonitoringTarget>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export const TargetsList: React.FC<TargetsListProps> = ({
  targets,
  onUpdate,
  onDelete,
}) => {
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  const toggleTarget = async (target: MonitoringTarget) => {
    await onUpdate(target.id, { isActive: !target.isActive });
  };

  const deleteTarget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      await onDelete(id);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  if (targets.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No monitoring targets</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating your first monitoring target.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {targets.map((target) => (
        <div key={target.id} className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${target.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <h3 className="text-lg font-medium text-gray-900">
                    {target.name || new URL(target.url).hostname}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    target.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {target.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 truncate">{target.url}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {target.keywords.map((keyword, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleTarget(target)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    target.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {target.isActive ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => setExpandedTarget(expandedTarget === target.id ? null : target.id)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className={`w-5 h-5 transform transition-transform ${
                    expandedTarget === target.id ? 'rotate-180' : ''
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteTarget(target.id)}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {expandedTarget === target.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Checked</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(target.lastChecked)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(target.createdAt)}</dd>
                  </div>
                  {target.selector && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">CSS Selector</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                        {target.selector}
                      </dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Full URL</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-all">
                      <a href={target.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {target.url}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};