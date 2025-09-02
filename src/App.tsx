import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'alerts'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTarget, setNewTarget] = useState({
    name: '',
    url: '',
    keywords: '',
    selector: ''
  });

  useEffect(() => {
    loadInitialData();
    
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

  const addTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newTarget.url || !newTarget.keywords) {
        alert('URL and keywords are required');
        return;
      }

      const keywords = newTarget.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
      
      const response = await fetch('http://localhost:3001/api/monitoring/targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: newTarget.url,
          keywords,
          selector: newTarget.selector || undefined,
          name: newTarget.name || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await loadTargets();
        setNewTarget({ name: '', url: '', keywords: '', selector: '' });
        setShowAddForm(false);
      } else {
        alert('Error adding target: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding target:', error);
      alert('Failed to add target');
    }
  };

  const toggleTarget = async (target: MonitoringTarget) => {
    try {
      const response = await fetch(`http://localhost:3001/api/monitoring/targets/${target.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !target.isActive }),
      });

      if (response.ok) {
        await loadTargets();
      }
    } catch (error) {
      console.error('Error toggling target:', error);
    }
  };

  const deleteTarget = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/monitoring/targets/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await loadTargets();
        }
      } catch (error) {
        console.error('Error deleting target:', error);
      }
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

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const activeTargets = targets.filter(target => target.isActive);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-lg p-2 mr-3">
                <span className="text-white">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bot Alert</h1>
                <p className="text-sm text-gray-500">Monitor websites for keyword matches</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {activeTargets.length} active targets | {unreadAlerts.length} unread alerts
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {['overview', 'targets', 'alerts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {tab === 'targets' && targets.length > 0 && (
                  <span style={{ marginLeft: '8px', backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '12px', padding: '2px 6px', borderRadius: '12px' }}>
                    {targets.length}
                  </span>
                )}
                {tab === 'alerts' && unreadAlerts.length > 0 && (
                  <span style={{ marginLeft: '8px', backgroundColor: '#fecaca', color: '#dc2626', fontSize: '12px', padding: '2px 6px', borderRadius: '12px' }}>
                    {unreadAlerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total Targets</h3>
                <p className="text-2xl font-bold text-gray-900">{targets.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Active Targets</h3>
                <p className="text-2xl font-bold text-gray-900">{activeTargets.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Total Alerts</h3>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500">Unread Alerts</h3>
                <p className="text-2xl font-bold text-gray-900">{unreadAlerts.length}</p>
              </div>
            </div>

            {targets.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 Get Started</h3>
                <p className="text-gray-600 mb-6">Welcome to Bot Alert! Start by adding your first monitoring target.</p>
                <button
                  onClick={() => { setActiveTab('targets'); setShowAddForm(true); }}
                  className="btn-primary"
                >
                  Add Your First Target
                </button>
              </div>
            )}
          </div>
        )}

        {/* Targets Tab */}
        {activeTab === 'targets' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Monitoring Targets</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Target
              </button>
            </div>

            {targets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No monitoring targets yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {targets.map((target) => (
                  <div key={target.id} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${target.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                          <h3 className="text-lg font-medium text-gray-900">
                            {target.name || new URL(target.url).hostname}
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            target.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {target.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{target.url}</p>
                        <div className="flex flex-wrap gap-1">
                          {target.keywords.map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleTarget(target)}
                          className={`px-3 py-1 rounded text-sm ${
                            target.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {target.isActive ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => deleteTarget(target.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Alerts</h2>
            
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No alerts yet. When your targets find matches, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
                    alert.isRead ? 'border-gray-200' : 'border-red-400'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          🚨 Keyword "{alert.keyword}" found
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.matchedText.substring(0, 200)}...
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()} • 
                          <a href={alert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                            View Source
                          </a>
                        </p>
                      </div>
                      {!alert.isRead && (
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Target Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div className="bg-white p-6 rounded-lg shadow-lg" style={{ width: '90%', maxWidth: '500px' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Monitoring Target</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={addTarget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Name (Optional)
                </label>
                <input
                  type="text"
                  value={newTarget.name}
                  onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LinkedIn Jobs"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={newTarget.url}
                  onChange={(e) => setNewTarget({ ...newTarget, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/jobs"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords *
                </label>
                <input
                  type="text"
                  required
                  value={newTarget.keywords}
                  onChange={(e) => setNewTarget({ ...newTarget, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="fullstack, react developer, remote"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords to search for</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSS Selector (Optional)
                </label>
                <input
                  type="text"
                  value={newTarget.selector}
                  onChange={(e) => setNewTarget({ ...newTarget, selector: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder=".job-listings, #content"
                />
                <p className="text-xs text-gray-500 mt-1">Target specific part of the page</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;