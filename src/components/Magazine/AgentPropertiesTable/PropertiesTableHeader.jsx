import React from 'react';

const PropertiesTableHeader = ({ departmentName, propertyCount, onRefresh }) => {
  return (
    <div className="flex justify-between items-center">
      <p className="text-gray-600">
        Department: {departmentName || 'N/A'} | 
        Total Properties: {propertyCount || 0}
      </p>
      <button 
        onClick={onRefresh}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh
      </button>
    </div>
  );
};

export default PropertiesTableHeader;