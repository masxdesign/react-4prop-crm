import React, { useState } from 'react';
import { AgentPropertiesTable } from './AgentPropertiesTableV1';
import { ScheduleManagement, ScheduleSummary } from './ScheduleManagement';
import { AdvertiserManagement, AdvertiserStats } from './AdvertiserManagement';

// Main Magazine Dashboard Component
export const MagazineDashboard = ({ userRole, userId }) => {
  const [activeTab, setActiveTab] = useState('properties');

  // Navigation tabs based on user role
  const getTabsForRole = (role) => {
    const baseTabs = [
      { id: 'properties', label: 'My Properties', roles: ['agent'] },
      { id: 'schedules', label: 'Schedules', roles: ['advertiser'] },
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
        return <div>Select a tab to get started</div>;
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
                Property advertising platform for 4prop.com
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

// Overview Content Component
const OverviewContent = ({ userRole, userId }) => {
  if (userRole === 'admin') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">System Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Active Schedules</span>
              <span className="font-semibold">--</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue (This Month)</span>
              <span className="font-semibold text-green-600">$--</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Properties</span>
              <span className="font-semibold">--</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              Recent schedules and activities will appear here...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'advertiser') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Your Magazine Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">--</div>
            <div className="text-sm text-gray-600">Properties Listed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">$--</div>
            <div className="text-sm text-gray-600">Total Investment</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Magazine Listing Page Component (for advertiser's public page)
export const MagazineListingPage = ({ advertiserId }) => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [advertiserInfo, setAdvertiserInfo] = useState(null);

  React.useEffect(() => {
    const fetchListingData = async () => {
      try {
        const response = await fetch(`/api/crm/mag/advertiser/${advertiserId}`);
        const data = await response.json();
        
        if (data.success) {
          setProperties(data.data);
          if (data.data.length > 0) {
            setAdvertiserInfo({
              company: data.data[0].advertiser_company
            });
          }
        }
      } catch (error) {
        console.error('Error fetching listing data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (advertiserId) {
      fetchListingData();
    }
  }, [advertiserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading magazine...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              {advertiserInfo?.company || 'Advertiser'} Property Magazine
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              Featured Properties on 4prop.com
            </p>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Properties Currently Listed
            </h3>
            <p className="text-gray-500">
              Check back later for featured properties from this advertiser.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div key={property.schedule_id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">Property #{property.property_id}</h3>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Featured
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Property Types:</span>{' '}
                      {property.property_subtypes?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ') || 'Various'}
                    </div>
                    <div>
                      <span className="font-medium">Featured Until:</span>{' '}
                      {new Date(property.end_date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      View Property Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>Powered by 4prop.com Magazine Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Usage Examples:
// For Agent: <MagazineDashboard userRole="agent" userId={123} />
// For Advertiser: <MagazineDashboard userRole="advertiser" userId={456} />
// For Admin: <MagazineDashboard userRole="admin" userId={789} />
// For Public Listing: <MagazineListingPage advertiserId={456} />