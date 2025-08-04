import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import bizchatClient from "@/services/bizchatClient"

// API functions
const fetchAgentProperties = async (agentId) => {
  const response = await bizchatClient.get(`/api/crm/mag/agent/${agentId}`);
  return response.data;
};

const fetchAdvertisersByPstids = async (pstids) => {
  const response = await bizchatClient.get(`/api/crm/mag/advertisers_by_pstids?pstids=${pstids}`);
  return response.data;
};

const fetchPropertySchedules = async (propertyId) => {
  const response = await bizchatClient.get(`/api/crm/mag/property/${propertyId}/schedules`);
  return response.data;
};

const createSchedule = async (agentId, scheduleData) => {
  const response = await bizchatClient.post(`/api/crm/mag/agent/${agentId}/schedule`, scheduleData);
  return response.data;
};

// Schedule Status Component
const ScheduleStatus = ({ schedule }) => {
  const getScheduleStatus = (schedule) => {
    const today = new Date();
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);

    if (isAfter(today, endDate)) return 'expired';
    if (isAfter(startDate, today)) return 'upcoming';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const status = getScheduleStatus(schedule);
  
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Current Schedules Component
const CurrentSchedules = ({ propertyId }) => {
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError
  } = useQuery({
    queryKey: ['property-schedules', propertyId],
    queryFn: () => fetchPropertySchedules(propertyId),
    enabled: !!propertyId,
  });

  const schedules = schedulesData?.data || [];

  // Calculate total revenue for this property
  const totalRevenue = schedules.reduce((total, schedule) => {
    const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
    return total + (schedule.fixed_day_rate * days);
  }, 0);

  if (schedulesLoading) {
    return (
      <div className="text-sm text-gray-500">Loading current schedules...</div>
    );
  }

  if (schedulesError) {
    return (
      <div className="text-sm text-red-500">Error loading schedules</div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded border">
        No schedules booked for this property yet.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h5 className="font-medium text-gray-900">Current Schedules ({schedules.length})</h5>
        <div className="text-sm font-semibold text-green-600">
          Total Revenue: ${totalRevenue.toFixed(2)}
        </div>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {schedules.map((schedule) => {
          const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
          const totalPrice = schedule.fixed_day_rate * days;
          
          return (
            <div key={schedule.id} className="bg-white p-4 rounded border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900">{schedule.advertiser_company}</div>
                  <div className="text-xs text-gray-500">Advertiser ID: {schedule.advertiser_id}</div>
                </div>
                <ScheduleStatus schedule={schedule} />
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Period:</span>
                  <div className="font-medium">
                    {format(parseISO(schedule.start_date), 'MMM dd, yyyy')} - {format(parseISO(schedule.end_date), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Duration:</span>
                  <div className="font-medium">{days} days</div>
                </div>
                <div>
                  <span className="text-gray-500">Day Rate:</span>
                  <div className="font-medium">${schedule.fixed_day_rate}/day</div>
                </div>
                <div>
                  <span className="text-gray-500">Total Price:</span>
                  <div className="font-semibold text-green-600">${totalPrice.toFixed(2)}</div>
                </div>
              </div>
              
              {schedule.notes && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">Notes:</span>
                  <div className="text-gray-700">{schedule.notes}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Property Details Component
const PropertyDetails = ({ property, agentId }) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Extract property subtype IDs for fetching advertisers
  const pstidsString = property.propertySubtypeIds?.replace(/^,|,$/g, '') || '';
  
  // Fetch advertisers based on property subtypes
  const {
    data: advertisersData,
    isLoading: advertisersLoading,
    error: advertisersError
  } = useQuery({
    queryKey: ['advertisers', pstidsString],
    queryFn: () => fetchAdvertisersByPstids(pstidsString),
    enabled: !!pstidsString,
  });

  // Schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: (scheduleData) => createSchedule(agentId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['agent-properties', agentId]);
      queryClient.invalidateQueries(['property-schedules', property.id]);
      setIsScheduleModalOpen(false);
    },
  });

  const advertisers = advertisersData?.data || [];

  return (
    <div className="bg-gray-50 p-6 border-t">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Property Information */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Property Information</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Property ID:</span> {property.id}
            </div>
            <div>
              <span className="font-medium">Department:</span> {property.departmentName}
            </div>
            <div>
              <span className="font-medium">Property Subtypes:</span>{' '}
              {property.propertySubtypeIds?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ') || 'None'}
            </div>
            <div>
              <span className="font-medium">Dealing Agents:</span>{' '}
              {property.dealsWith?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ') || 'None'}
            </div>
          </div>
        </div>

        {/* Current Schedules */}
        <div className="lg:col-span-2">
          <CurrentSchedules propertyId={property.id} />
        </div>
      </div>

      {/* Available Advertisers Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg">Available Advertisers for New Booking</h4>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            disabled={advertisers.length === 0}
          >
            + Schedule New Advertiser
          </button>
        </div>
        
        {advertisersLoading && (
          <div className="text-sm text-gray-500">Loading advertisers...</div>
        )}
        
        {advertisersError && (
          <div className="text-sm text-red-500">Error loading advertisers</div>
        )}
        
        {advertisers.length === 0 && !advertisersLoading && (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded border">
            No advertisers available for this property type
          </div>
        )}
        
        {advertisers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advertisers.map((advertiser) => (
              <div key={advertiser.id} className="bg-white p-4 rounded border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{advertiser.company}</div>
                  <div className="text-lg font-semibold text-green-600">
                    ${advertiser.day_rate}/day
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  ID: {advertiser.id}
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  Subtypes: {advertiser.pstids?.replace(/^,|,$/g, '').split(',').filter(id => id.trim()).join(', ')}
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Book This Advertiser
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <ScheduleModal
          property={property}
          advertisers={advertisers}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmit={(data) => scheduleMutation.mutate(data)}
          isLoading={scheduleMutation.isPending}
          error={scheduleMutation.error}
        />
      )}
    </div>
  );
};

// Schedule Modal Component
const ScheduleModal = ({ property, advertisers, onClose, onSubmit, isLoading, error }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  
  const watchedAdvertiserId = watch('advertiser_id');
  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');
  
  // Find selected advertiser for price calculation
  const selectedAdvertiser = advertisers.find(adv => adv.id === parseInt(watchedAdvertiserId));
  
  // Calculate total price preview
  const calculateTotalPrice = () => {
    if (!selectedAdvertiser || !watchedStartDate || !watchedEndDate) return 0;
    
    const days = Math.ceil((new Date(watchedEndDate) - new Date(watchedStartDate)) / (1000 * 60 * 60 * 24));
    return days > 0 ? selectedAdvertiser.day_rate * days : 0;
  };
  
  const totalPrice = calculateTotalPrice();
  const days = watchedStartDate && watchedEndDate ? 
    Math.ceil((new Date(watchedEndDate) - new Date(watchedStartDate)) / (1000 * 60 * 60 * 24)) : 0;

  const handleFormSubmit = (data) => {
    onSubmit({
      property_id: property.id,
      advertiser_id: parseInt(data.advertiser_id),
      start_date: data.start_date,
      end_date: data.end_date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Schedule Advertiser</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Property</label>
            <input
              type="text"
              value={`${property.id} - ${property.departmentName}`}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Advertiser *</label>
            <select
              {...register('advertiser_id', { required: 'Please select an advertiser' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an advertiser...</option>
              {advertisers.map((advertiser) => (
                <option key={advertiser.id} value={advertiser.id}>
                  {advertiser.company} - ${advertiser.day_rate}/day
                </option>
              ))}
            </select>
            {errors.advertiser_id && (
              <p className="text-red-500 text-sm mt-1">{errors.advertiser_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Start Date *</label>
            <input
              type="date"
              {...register('start_date', { required: 'Start date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date *</label>
            <input
              type="date"
              {...register('end_date', { required: 'End date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.end_date && (
              <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
            )}
          </div>

          {/* Price Calculation Preview */}
          {selectedAdvertiser && days > 0 && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Advertiser:</span>
                  <span className="font-medium">{selectedAdvertiser.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Duration:</span>
                  <span className="font-medium">{days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Day Rate:</span>
                  <span className="font-medium">${selectedAdvertiser.day_rate}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                  <span className="text-blue-700 font-medium">Total Price:</span>
                  <span className="font-bold text-green-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error.response?.data?.error || 'An error occurred while scheduling'}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !totalPrice}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Scheduling...' : `Schedule for $${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
    <React.Fragment>
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
    </React.Fragment>
  );
};

// Property Schedules Summary Component (for table row)
const PropertySchedulesSummary = ({ propertyId }) => {
  const {
    data: schedulesData,
    isLoading
  } = useQuery({
    queryKey: ['property-schedules', propertyId],
    queryFn: () => fetchPropertySchedules(propertyId),
    enabled: !!propertyId,
  });

  if (isLoading) {
    return <div className="text-xs text-gray-500">Loading...</div>;
  }

  const schedules = schedulesData?.data || [];
  
  if (schedules.length === 0) {
    return <div className="text-xs text-gray-500">No schedules</div>;
  }

  const totalRevenue = schedules.reduce((total, schedule) => {
    const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
    return total + (schedule.fixed_day_rate * days);
  }, 0);

  const activeSchedules = schedules.filter(schedule => {
    const today = new Date();
    const startDate = parseISO(schedule.start_date);
    const endDate = parseISO(schedule.end_date);
    return !isAfter(today, endDate) && !isBefore(today, startDate);
  }).length;

  return (
    <div className="text-xs">
      <div className="font-medium">{schedules.length} total</div>
      <div className="text-green-600">{activeSchedules} active</div>
      <div className="text-green-600 font-semibold">${totalRevenue.toFixed(0)}</div>
    </div>
  );
};

export default AgentPropertiesTable;