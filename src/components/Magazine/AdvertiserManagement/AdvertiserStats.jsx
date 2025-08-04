import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllAdvertisers } from '../api';

// Quick Stats Component - Updated for week-based system
const AdvertiserStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['advertisers'],
    queryFn: fetchAllAdvertisers,
  });

  if (isLoading) return <div className="text-sm text-gray-500">Loading stats...</div>;

  const advertisers = data?.data || [];
  const totalAdvertisers = advertisers.length;
  
  // Calculate averages using week_rate with fallback to day_rate for legacy data
  const avgWeekRate = advertisers.length > 0 
    ? (advertisers.reduce((sum, adv) => {
        const rate = adv.week_rate || (adv.day_rate * 7) || 0; // Convert day rate to week rate if needed
        return sum + parseFloat(rate);
      }, 0) / advertisers.length).toFixed(2)
    : 0;

  const highestRate = advertisers.length > 0 
    ? Math.max(...advertisers.map(adv => {
        const rate = adv.week_rate || (adv.day_rate * 7) || 0; // Convert day rate to week rate if needed
        return parseFloat(rate);
      })).toFixed(2)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-gray-900">{totalAdvertisers}</div>
        <div className="text-sm text-gray-500">Total Advertisers</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-blue-600">£{avgWeekRate}</div>
        <div className="text-sm text-gray-500">Average Week Rate</div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="text-2xl font-bold text-green-600">£{highestRate}</div>
        <div className="text-sm text-gray-500">Highest Week Rate</div>
      </div>
    </div>
  );
};

export default AdvertiserStats;