import React from 'react';

const AdvertiserCard = ({ 
  advertiser, 
  subtypeLabels = [], 
  onBook,
  className = '' 
}) => {
  return (
    <div className={`bg-white p-4 rounded border border-gray-200 hover:border-blue-300 transition-colors ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-gray-900 flex-1">
          {advertiser.company}
        </div>
        <div className="text-lg font-semibold text-green-600 ml-2">
          £{advertiser.week_rate}/week
        </div>
      </div>
      
      {subtypeLabels.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Subtypes:</div>
          <div className="flex flex-wrap gap-1">
            {subtypeLabels.map((label, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={() => onBook?.(advertiser)}
        className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Book This Advertiser
      </button>
    </div>
  );
};

export default AdvertiserCard;