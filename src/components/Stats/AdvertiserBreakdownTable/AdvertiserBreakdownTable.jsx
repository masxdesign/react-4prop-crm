import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useStatsExpand } from '../context/StatsExpandContext';
import { useAgencyAdvertiserProperties } from '../stats.hooks';
import PropertyRow from '../PropertyRow/PropertyRow';

const columnHelper = createColumnHelper();

/**
 * ExpandableAdvertiserRow Component
 * Handles data fetching for a single advertiser row when expanded
 */
const ExpandableAdvertiserRow = ({
  row,
  columns,
  agencyId,
  startDate,
  endDate,
  isExpanded
}) => {
  const advertiserId = row.original.advertiser_id;

  // Fetch properties only when expanded
  const { data: properties = [], isLoading, error } = useAgencyAdvertiserProperties(
    agencyId,
    advertiserId,
    startDate,
    endDate,
    { enabled: isExpanded }
  );

  return (
    <>
      {/* Expanded properties section */}
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={columns.length} className="p-0">
            <div className="bg-muted/30 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  <span className="text-gray-600">Loading properties...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  Error loading properties: {error.message}
                </div>
              ) : properties.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Properties ({properties.length})
                  </h4>
                  {properties.map((property) => (
                    <PropertyRow key={property.pid} property={property} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No properties found for this advertiser
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

/**
 * AdvertiserBreakdownTable Component
 *
 * Level 2: Displays advertiser breakdown with expandable rows (for agency page)
 * Level 3: Lazy-loads properties when advertiser row is expanded
 *
 * @param {Object} props
 * @param {Array} props.advertiserBreakdown - Array of advertiser summary objects
 * @param {string} props.agencyId - The agency ID
 * @param {string} props.startDate - Start date for property queries
 * @param {string} props.endDate - End date for property queries
 */
const AdvertiserBreakdownTable = ({
  advertiserBreakdown = [],
  agencyId,
  startDate,
  endDate,
}) => {
  const {
    isEntityExpanded,
    toggleEntity,
  } = useStatsExpand();

  // Handle advertiser row click - toggle expand
  const handleAdvertiserClick = (advertiser) => {
    const advertiserId = advertiser.advertiser_id;
    toggleEntity(advertiserId);
  };

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          const advertiserId = row.original.advertiser_id;
          const isExpanded = isEntityExpanded(advertiserId);

          return (
            <div className="flex items-center justify-center w-6">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('advertiser_name', {
        header: 'Advertiser Name',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('totalProperties', {
        header: 'Total Properties',
        cell: (info) => info.getValue()?.toLocaleString() || 0,
      }),
      columnHelper.accessor('phone_reveals', {
        header: 'Phone Reveals',
        cell: (info) => info.getValue()?.toLocaleString() || 0,
      }),
      columnHelper.accessor('pdf_requests', {
        header: 'View PDF',
        cell: (info) => info.getValue()?.toLocaleString() || 0,
      }),
      columnHelper.accessor('viewing_requests', {
        header: 'Viewing Requests',
        cell: (info) => info.getValue()?.toLocaleString() || 0,
      }),
      columnHelper.accessor('search_clicks', {
        header: 'Search Clicks',
        cell: (info) => info.getValue()?.toLocaleString() || 0,
      }),
      columnHelper.accessor('enquiry_submissions', {
        header: 'Enquiries',
        cell: (info) => info.getValue()?.toLocaleString() || 0,
      }),
    ],
    [isEntityExpanded]
  );

  const table = useReactTable({
    data: advertiserBreakdown,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: 'totalProperties', desc: true }],
    },
  });

  // Empty state
  if (!advertiserBreakdown || advertiserBreakdown.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No advertisers found</h3>
        <p className="text-sm text-gray-500">
          No advertiser data available for the selected date range.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const advertiserId = row.original.advertiser_id;
            const isExpanded = isEntityExpanded(advertiserId);

            return (
              <React.Fragment key={row.id}>
                {/* Main advertiser row */}
                <TableRow
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleAdvertiserClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Expandable properties row with data fetching */}
                <ExpandableAdvertiserRow
                  row={row}
                  columns={columns}
                  agencyId={agencyId}
                  startDate={startDate}
                  endDate={endDate}
                  isExpanded={isExpanded}
                />
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdvertiserBreakdownTable;
