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
import { useAdvertiserAgencyProperties } from '../stats.hooks';
import PropertyRow from '../PropertyRow/PropertyRow';

const columnHelper = createColumnHelper();

/**
 * ExpandableAgencyRow Component
 * Handles data fetching for a single agency row when expanded
 */
const ExpandableAgencyRow = ({
  row,
  columns,
  advertiserId,
  startDate,
  endDate,
  isExpanded
}) => {
  const agencyId = row.original.agency_id;

  // Fetch properties only when expanded
  const { data, isLoading, error } = useAdvertiserAgencyProperties(
    advertiserId,
    agencyId,
    startDate,
    endDate,
    { enabled: isExpanded }
  );

  // Extract properties array from response
  const properties = data?.properties || [];

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
                  No properties found for this agency
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
 * AgencyBreakdownTable Component
 *
 * Level 2: Displays agency breakdown with expandable rows
 * Level 3: Lazy-loads properties when agency row is expanded
 *
 * @param {Object} props
 * @param {Array} props.agencyBreakdown - Array of agency summary objects
 * @param {string} props.advertiserId - The advertiser ID
 * @param {string} props.startDate - Start date for property queries
 * @param {string} props.endDate - End date for property queries
 */
const AgencyBreakdownTable = ({
  agencyBreakdown = [],
  advertiserId,
  startDate,
  endDate,
}) => {
  const {
    isEntityExpanded,
    toggleEntity,
  } = useStatsExpand();

  // Handle agency row click - toggle expand
  const handleAgencyClick = (agency) => {
    const agencyId = agency.agency_id;
    toggleEntity(agencyId);
  };

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          const agencyId = row.original.agency_id;
          const isExpanded = isEntityExpanded(agencyId);

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
      columnHelper.accessor('agency_name', {
        header: 'Agency Name',
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('search_clicks', {
        header: 'Clicks',
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
    ],
    [isEntityExpanded]
  );

  const table = useReactTable({
    data: agencyBreakdown,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: 'search_clicks', desc: true }],
    },
  });

  // Empty state
  if (!agencyBreakdown || agencyBreakdown.length === 0) {
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No agencies found</h3>
        <p className="text-sm text-gray-500">
          No agency data available for the selected date range.
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
            const agencyId = row.original.agency_id;
            const isExpanded = isEntityExpanded(agencyId);

            return (
              <React.Fragment key={row.id}>
                {/* Main agency row */}
                <TableRow
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleAgencyClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Expandable properties row with data fetching */}
                <ExpandableAgencyRow
                  row={row}
                  columns={columns}
                  advertiserId={advertiserId}
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

export default AgencyBreakdownTable;
