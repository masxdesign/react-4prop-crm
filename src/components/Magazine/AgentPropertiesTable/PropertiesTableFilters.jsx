import React from 'react';

const PropertiesTableFilters = ({ table }) => {
  return (
    <div className="flex gap-4">
      <input
        placeholder="Filter by Property ID..."
        value={(table.getColumn('id')?.getFilterValue()) ?? ''}
        onChange={(event) =>
          table.getColumn('id')?.setFilterValue(event.target.value)
        }
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        placeholder="Filter by Department..."
        value={(table.getColumn('departmentName')?.getFilterValue()) ?? ''}
        onChange={(event) =>
          table.getColumn('departmentName')?.setFilterValue(event.target.value)
        }
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default PropertiesTableFilters;