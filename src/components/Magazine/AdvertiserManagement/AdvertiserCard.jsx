import React from 'react';

// Advertiser Card Component - Updated for week-based system
const AdvertiserCard = ({ advertiser, onEdit, onDelete, isDeleting }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${advertiser.company}"?`)) {
      onDelete(advertiser);
    }
  };

  // Display week rate with fallback to converted day rate for legacy data
  const weekRate = advertiser.week_rate || (advertiser.day_rate * 7) || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{advertiser.company}</h3>
          <p className="text-sm text-gray-500">ID: {advertiser.id}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            £{weekRate}/week
          </div>
          {advertiser.day_rate && !advertiser.week_rate && (
            <div className="text-xs text-gray-400">
              (£{advertiser.day_rate}/day)
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-500">Property Subtypes:</span>
          <div className="text-sm">
            {advertiser.pstids 
              ? advertiser.pstids.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ')
              : 'All types'
            }
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(advertiser)}
          className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default AdvertiserCard;