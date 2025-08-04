import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import bizchatClient from '@/services/bizchatClient';
import PropertyDetails from './PropertyDetails';
import PropertySchedulesSummary from './PropertySchedulesSummary';

// API functions
const fetchAgentProperties = async (agentId) => {
  const response = await bizchatClient.get(`/api/crm/mag/agent/${agentId}`);
  return response.data;
};

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Properties</h2>
          <p className="text-gray-600">
            Department: {data?.departmentName || 'N/A'} | 
            Total Properties: {data?.data?.length || 0}
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Filter Input */}
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

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      <span>
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted()] ?? null}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <React.Fragment key={row.id}>
                <tr className="hover:bg-gray-50 cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {expandedRows.has(row.id) && (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      <div className="max-h-[500px] overflow-y-auto">
                        <PropertyDetails 
                          property={row.original} 
                          agentId={agentId}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {data?.data?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No properties found for your department.</p>
        </div>
      )}
    </div>
  );
};

export default AgentPropertiesTable;