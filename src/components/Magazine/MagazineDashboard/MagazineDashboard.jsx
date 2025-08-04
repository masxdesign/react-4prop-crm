import React, { useState } from 'react';
import AgentPropertiesTable from './AgentPropertiesTable';
import ScheduleManagement from './ScheduleManagement';
import ScheduleSummary from './ScheduleSummary';
import AdvertiserManagement from './AdvertiserManagement';
import AdvertiserStats from './AdvertiserStats';
import OverviewContent from './OverviewContent';

// Main Magazine Dashboard Component - Updated for week-based system
const MagazineDashboard = ({ userRole, userId }) => {
  const [activeTab, setActiveTab] = useState(() => {
    // Set default tab based on user role
    switch (userRole) {
      case 'agent':
        return 'properties';
      case 'advertiser':
        return 'schedules';
      case 'admin':
        return 'advertisers';
      default:
        return 'properties';
    }
  });

  // Navigation tabs based on user role
  const getTabsForRole = (role) => {
    const baseTabs = [
      { id: 'properties', label: 'My Properties', roles: ['agent'] },
      { id: 'schedules', label: 'My Schedules', roles: ['advertiser'] },
      { id: 'advertisers', label: 'Manage Advertisers', roles: ['admin'] },
      { id: 'overview', label: 'Overview', roles: ['admin', 'advertiser'] }
    ];

    return baseTabs.filter(tab => tab.roles.includes(role));
  };

  const tabs = getTabsForRole(userRole);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'properties':
        return <AgentPropertiesTable agentId={userId} />;
      
      case 'schedules':
        return (
          <div className="space-y-6">
            <ScheduleSummary advertiserId={userId} />
            <ScheduleManagement advertiserId={userId} />
          </div>
        );
      
      case 'advertisers':
        return (
          <div className="space-y-6">
            <AdvertiserStats />
            <AdvertiserManagement />
          </div>
        );
      
      case 'overview':
        return (
          <div className="space-y-6">
            {userRole === 'advertiser' && <ScheduleSummary advertiserId={userId} />}
            {userRole === 'admin' && <AdvertiserStats />}
            <OverviewContent userRole={userRole} userId={userId} />
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Magazine Management</h3>
            <p className="text-gray-600">Select a tab to get started with managing your properties and advertisements.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Magazine Management</h1>
              <p className="text-gray-600">
                Property advertising platform for 4prop.com - Weekly advertising solutions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Role: <span className="font-medium capitalize">{userRole}</span>
              </span>
              <span className="text-sm text-gray-500">
                ID: <span className="font-medium">{userId}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {tabs.length > 1 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MagazineDashboard;