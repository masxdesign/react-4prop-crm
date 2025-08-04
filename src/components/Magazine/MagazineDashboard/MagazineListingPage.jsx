import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMagazineListingData } from '../api';

// Magazine Listing Page Component (for advertiser's public page) - Updated for week-based system
const MagazineListingPage = ({ advertiserId }) => {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['magazine-listing', advertiserId],
    queryFn: () => fetchMagazineListingData(advertiserId),
    enabled: !!advertiserId,
  });

  const properties = data?.success ? data.data : [];
  const advertiserInfo = properties.length > 0 ? {
    company: properties[0].advertiser_company
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading magazine...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error loading magazine</div>
          <p className="text-gray-600">Please try again later.</p>
        </div>
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
                    {property.week_no && (
                      <div>
                        <span className="font-medium">Duration:</span>{' '}
                        {property.week_no} week{property.week_no !== 1 ? 's' : ''}
                      </div>
                    )}
                    {property.total_cost && (
                      <div>
                        <span className="font-medium">Investment:</span>{' '}
                        <span className="text-green-600 font-semibold">£{property.total_cost}</span>
                      </div>
                    )}
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

export default MagazineListingPage;