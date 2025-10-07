import React from 'react';

const PropertiesTableFilters = ({ table }) => {
  return (
    <div className="flex gap-4">
      <input
        placeholder="Filter by Address..."
        value={(table.getColumn('addressText')?.getFilterValue()) ?? ''}
        onChange={(event) =>
          table.getColumn('addressText')?.setFilterValue(event.target.value)
        }
        className="px-2 py-1 border border-gray-300 rounded-sm text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default PropertiesTableFilters;