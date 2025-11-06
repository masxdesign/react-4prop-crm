import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';
import { pluralizeWeeks } from '../util/pluralize';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const columnHelper = createColumnHelper();

const BookingHistoryTable = ({ bookings, isAdvertiser, pagination, onPageChange }) => {
  // Define columns based on user role
  const columns = useMemo(() => {
    const baseColumns = [
      columnHelper.accessor('start_date', {
        header: 'Start Date',
        cell: (info) => {
          const date = info.getValue();
          try {
            return format(new Date(date), 'dd MMM yyyy');
          } catch (e) {
            return date || 'N/A';
          }
        },
        sortingFn: 'datetime',
      }),
      columnHelper.accessor('pid', {
        header: 'Property ID',
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue() || 'N/A'}</span>
        ),
      }),
    ];

    // Add role-specific column (Agency for advertisers, Advertiser for agents)
    if (isAdvertiser) {
      baseColumns.push(
        columnHelper.accessor('agent_company_name', {
          header: 'Agency',
          cell: (info) => {
            const name = info.getValue();
            return (
              <span className="font-medium text-gray-900">
                {name || <span className="text-gray-400 italic">N/A</span>}
              </span>
            );
          },
        })
      );
    } else {
      baseColumns.push(
        columnHelper.accessor('advertiser_company', {
          header: 'Advertiser',
          cell: (info) => {
            const name = info.getValue();
            return (
              <span className="font-medium text-gray-900">
                {name || <span className="text-gray-400 italic">N/A</span>}
              </span>
            );
          },
        })
      );
    }

    // Add remaining columns
    baseColumns.push(
      columnHelper.accessor('week_no', {
        header: 'Duration',
        cell: (info) => {
          const weeks = info.getValue();
          return weeks ? pluralizeWeeks(weeks) : 'N/A';
        },
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <BookingStatusBadge status={info.getValue()} />,
      })
    );

    return baseColumns;
  }, [isAdvertiser]);

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [
        {
          id: 'start_date',
          desc: true, // Newest first by default
        },
      ],
    },
  });

  // Empty state
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
        <p className="text-sm text-gray-500">
          {isAdvertiser
            ? "You don't have any active subscriptions yet."
            : "No properties have been booked with active subscriptions yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden border rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span className="text-gray-400">
                            {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border rounded-lg bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing page <span className="font-medium">{pagination.page}</span> of{' '}
            <span className="font-medium">{pagination.totalPages}</span>
            {' '}({pagination.total} total {pagination.total === 1 ? 'booking' : 'bookings'})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryTable;
