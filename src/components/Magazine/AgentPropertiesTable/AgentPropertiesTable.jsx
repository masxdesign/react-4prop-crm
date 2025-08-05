import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { fetchAgentProperties } from '../api';
import PropertySchedulesSummary from './PropertySchedulesSummary';
import PropertiesTableHeader from './PropertiesTableHeader';
import PropertiesTableFilters from './PropertiesTableFilters';
import PropertiesDataTable from './PropertiesDataTable';

// Column helper
const columnHelper = createColumnHelper();

// Main Component
const AgentPropertiesTable = ({ agentId }) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch data using React Query
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['agent-properties', agentId],
    queryFn: () => fetchAgentProperties(agentId),
    enabled: !!agentId,
  });

  // Toggle row expansion
  const toggleRowExpansion = (rowId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  // Action handlers
  const handleViewProperty = (propertyId) => {
    console.log('View property:', propertyId);
    // Implement view property logic
  };

  // Table columns
  const columns = [
    columnHelper.accessor('id', {
      header: 'Property ID',
      cell: (info) => (
        <button
          onClick={() => toggleRowExpansion(info.row.id)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {info.getValue()}
          <span className="ml-2">
            {expandedRows.has(info.row.id) ? '▼' : '▶'}
          </span>
        </button>
      ),
    }),
    columnHelper.accessor('departmentName', {
      header: 'Department',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('propertySubtypeIds', {
      header: 'Property Subtypes',
      cell: (info) => {
        const pstids = info.getValue();
        if (!pstids) return 'None';
        const ids = pstids.replace(/^,|,$/g, '').split(',').filter(id => id.trim());
        return ids.length > 3 ? `${ids.slice(0, 3).join(', ')}...` : ids.join(', ');
      },
    }),
    columnHelper.accessor('dealsWith', {
      header: 'Dealing Agents',
      cell: (info) => {
        const agents = info.getValue();
        if (!agents) return 'None';
        const agentIds = agents.replace(/^,|,$/g, '').split(',').filter(id => id.trim());
        return agentIds.length > 2 ? `${agentIds.slice(0, 2).join(', ')}...` : agentIds.join(', ');
      },
    }),
    columnHelper.display({
      id: 'schedules',
      header: 'Schedules',
      cell: (info) => <PropertySchedulesSummary propertyId={info.row.original.id} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          <button 
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => handleViewProperty(info.row.original.id)}
          >
            View
          </button>
          <button 
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => toggleRowExpansion(info.row.id)}
          >
            {expandedRows.has(info.row.id) ? 'Hide' : 'Details'}
          </button>
        </div>
      ),
    }),
  ];

  // Table instance
  const table = useReactTable({
    data: data?.data || [],
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading properties...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 mb-4">Error loading properties</div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className='grid grid-rows-[3rem_1fr] min-h-0 py-4'>
        <div className='flex items-end py-4 gap-0 text-white px-3'>
            <div className='flex-1'>  
              <span className='text-xl font-bold'>
                  My properties
              </span>
              <PropertiesTableHeader 
                departmentName={data?.departmentName}
                propertyCount={data?.data?.length}
                onRefresh={() => refetch()}
              />
            </div>
              <PropertiesTableFilters table={table} />
        </div>
        <PropertiesDataTable 
          table={table}
          columns={columns}
          expandedRows={expandedRows}
          toggleRowExpansion={toggleRowExpansion}
          agentId={agentId}
          isEmpty={data?.data?.length === 0}
          className="bg-gray-100 rounded-lg"
        />
    </div>
  );
};

export default AgentPropertiesTable;