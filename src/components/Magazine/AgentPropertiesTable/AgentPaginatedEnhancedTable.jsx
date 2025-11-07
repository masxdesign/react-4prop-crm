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
import { BrickWallIcon, Building, Clock, AlertCircle } from 'lucide-react';
import ClientOnly from '@/components/ui/ClientOnly';

// Column helper
const columnHelper = createColumnHelper();

// Main Enhanced Component
const AgentPaginatedEnhancedTable = ({
  agentId,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isAdminViewing = false,
  adminNid = null
}) => {
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
    columnHelper.group({
      id: 'property_info',
      header: () => (
        <div className='flex gap-2'>
          <span>Properties</span>
          <Building className='size-4' strokeWidth={2} />
        </div>
      ),
      columns: [
        columnHelper.accessor('addressText', {
          header: 'Address',
          cell: (info) => (
            <div className="flex items-center gap-2 max-w-xs">
               <span className="text-slate-600 text-[9px]">
                {expandedRows.has(info.row.original.pid) ? '▼' : '▶'}
              </span>
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
      ],
    }),
    columnHelper.group({
      id: 'schedules',
      header: () => (
        <div className='flex gap-2'>
          <span>Schedules</span>
          <Clock className='size-4' strokeWidth={2} />
        </div>
      ),
      columns: [
        columnHelper.accessor((row) => row.original?.schedules_total, {
          id: 'schedules_total',
          header: 'Total',
          cell: (info) => (
            <div className="text-center">
              <span className="bg-slate-100 text-muted-foreground px-2 py-1 rounded-full text-xs font-medium">
                {info.getValue() || 0}
              </span>
            </div>
          ),
        }),
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
    enableColumnGrouping: true
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
    <div className='flex flex-col min-h-0 py-4 relative'>
      {/* Admin Viewing Banner */}
      {isAdminViewing && rawData?.departmentName && (
        <div className="mx-3 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Viewing as Agent (NID: {agentId})
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Department: {rawData.departmentName}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                All scheduling and editing operations will be performed using this agent's ID
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='grid grid-rows-[2.5rem_1fr_auto] min-h-0 flex-1'>
      {enhancedProperties?.length !== 0 && (
        <div className='flex items-start gap-0 mr-3'>
          <div className='flex-1 flex justify-between'>
            <span className='text-xl font-bold'>
              {isAdminViewing ? 'Agent Department Properties' : 'My Department properties'} {rawData?.total || 0}
            </span>
            <div className="flex gap-2 items-center">
              <Button 
                size="xs"
                variant="link"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : (
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )}
              </Button>
              <PropertiesTableFilters table={table} />
            </div>
          </div>
        </div>
      )}

      {/* 
        Temporary patch for TanStack Table React state update warnings
        @see https://github.com/TanStack/table/issues/5026 
      */}
      <ClientOnly>
        <EnhancedPropertiesDataTable 
          table={table}
          columns={columns}
          expandedRows={expandedRows}
          toggleRowExpansion={toggleRowExpansion}
          agentId={agentId}
          isEmpty={enhancedProperties?.length === 0}
          className="bg-gray-100 rounded-lg mr-3"
        />
      </ClientOnly>

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
    </div>
  );
};

export default AgentPaginatedEnhancedTable;