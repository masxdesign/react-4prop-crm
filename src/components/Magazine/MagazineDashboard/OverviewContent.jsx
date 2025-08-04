import React from 'react';

// Overview Content Component - Updated for week-based system
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
              <span className="font-semibold text-green-600">£--</span>
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
            <div className="text-2xl font-bold text-green-600">£--</div>
            <div className="text-sm text-gray-600">Total Investment</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">--</div>
            <div className="text-sm text-gray-600">Weeks Active</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OverviewContent;