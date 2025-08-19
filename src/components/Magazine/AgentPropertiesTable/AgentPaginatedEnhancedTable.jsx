import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { fetchAgentPaginatedProperties } from '../api';
import PropertiesTableFilters from './PropertiesTableFilters';
import EnhancedPropertiesDataTable from './EnhancedPropertiesDataTable';
import TablePagination from './TablePagination';
import { Button } from '@/components/ui/button';
import { useEnhancedPropertiesWithExpansion } from '@/hooks/propertyDetails-hooks';

// Column helper
const columnHelper = createColumnHelper();

// Main Enhanced Component
const AgentPaginatedEnhancedTable = ({ agentId, page, pageSize, onPageChange, onPageSizeChange }) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Fetch raw data using React Query
  const {
    data: rawData,
    isLoading: rawIsLoading,
    isFetching,
    isPlaceholderData,
    error: rawError,
    refetch
  } = useQuery({
    queryKey: ['agent-properties-paginated', agentId, page, pageSize],
    queryFn: () => fetchAgentPaginatedProperties(agentId, { page, pageSize }),
    placeholderData: keepPreviousData,
    enabled: !!agentId
  });

  // Use enhanced properties hook 
  const {
    data: enhancedProperties,
    isLoading: enhancedIsLoading,
    error: enhancedError
  } = useEnhancedPropertiesWithExpansion(rawData?.data);

  // Toggle row expansion
  const toggleRowExpansion = (pid) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(pid)) {
      newExpanded.delete(pid);
    } else {
      newExpanded.add(pid);
    }
    setExpandedRows(newExpanded);
  };

  const handleRefresh = () => {
    refetch();
    setExpandedRows(new Set());
  };

  // Enhanced table columns using display-ready fields
  const columns = [
    columnHelper.accessor('addressText', {
      header: 'Address',
      cell: (info) => (
        <div className="flex items-center gap-2 max-w-xs">
          {info.row.original.thumbnail ? (
            <img 
              src={info.row.original.thumbnail} 
              alt="Property thumbnail"
              className="w-6 h-6 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <div className="truncate" title={info.getValue()}>
            {info.getValue() || 'Address unavailable'}
          </div>
          <span className="ml-auto text-blue-600">
            {expandedRows.has(info.row.original.pid) ? '▼' : '▶'}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('typesText', {
      header: 'Property Types',
      cell: (info) => (
        <div className="max-w-xs">
          <div className="truncate" title={info.getValue()}>
            {info.getValue() || 'No types'}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('subtypesText', {
      header: 'Subtypes',
      cell: (info) => (
        <div className="max-w-xs">
          <div className="truncate" title={info.getValue()}>
            {info.getValue() || 'No subtypes'}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('tenureText', {
      header: 'Tenure',
      cell: (info) => (
        <div className="font-medium text-green-600">
          {info.getValue() || 'N/A'}
        </div>
      ),
    }),
    columnHelper.accessor('statusText', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        const color = info.row.original.statusColor || 'gray';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
            {status || 'Unknown'}
          </span>
        );
      },
    }),
    columnHelper.group({
      id: 'schedules',
      header: () => (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <span>Schedules</span>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              total
            </span>
          </div>
        </div>
      ),
      columns: [
        columnHelper.accessor((row) => row.original?.schedules_to_approve, {
          id: 'schedules_to_approve',
          header: 'Approve',
          cell: (info) => (
            <div className="text-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                {info.getValue() || 0}
              </span>
            </div>
          ),
        }),
        columnHelper.accessor((row) => row.original?.schedules_to_pay, {
          id: 'schedules_to_pay',
          header: 'Pay',
          cell: (info) => (
            <div className="text-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {info.getValue() || 0}
              </span>
            </div>
          ),
        }),
      ],
    }),
  ];

  // Table instance using enhanced properties
  const table = useReactTable({
    data: enhancedProperties || [],
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
    getGroupedRowModel: getGroupedRowModel(),
    enableColumnGrouping: true,
  });

  // Handle errors
  const error = rawError || enhancedError;
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

  // Loading state
  const isLoading = rawIsLoading || enhancedIsLoading;

  return (
    <div className='grid grid-rows-[5rem_1fr_auto] min-h-0 py-4 relative'>
      <div className='flex items-end py-4 gap-0 text-white px-3'>
        <div className='flex-1'>  
          <span className='text-xl font-bold'>
            My Enhanced Properties
          </span>
          <div className="flex justify-between items-center">
            <div className="text-white mix-blend-overlay space-y-1">
              <p>
                Department: {rawData?.departmentName || 'N/A'} | 
                Total Properties: {rawData?.total || 0}
              </p>
              <p className="text-sm">
                Enhanced: {enhancedProperties?.length || 0} | 
                Expanded: {expandedRows.size}
              </p>
            </div>
            <Button 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
        <PropertiesTableFilters table={table} />
      </div>

      <EnhancedPropertiesDataTable 
        table={table}
        columns={columns}
        expandedRows={expandedRows}
        toggleRowExpansion={toggleRowExpansion}
        agentId={agentId}
        isEmpty={enhancedProperties?.length === 0}
        className="bg-gray-100 rounded-lg"
      />

      {rawData?.data && rawData.data.length > 0 && (
        <TablePagination
          currentPage={rawData.page}
          totalPages={rawData.totalPages}
          pageSize={rawData.pageSize}
          total={rawData.total}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
        />
      )}
      
      {/* Loading Overlay - Show when refetching data and showing placeholder data */}
      {isFetching && isPlaceholderData && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700 font-medium">Loading...</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default AgentPaginatedEnhancedTable;