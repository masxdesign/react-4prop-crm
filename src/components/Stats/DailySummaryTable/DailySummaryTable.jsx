import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const columnHelper = createColumnHelper();

/**
 * DailySummaryTable Component
 *
 * Displays daily metrics in a table format with a totals row at the top.
 * Columns: Date | Clicks | Phone Reveals | View PDF | Viewing Requests
 *
 * @param {Object} props
 * @param {Array} props.dailySummary - Array of daily summary objects
 * @param {Object} props.className - Additional CSS classes
 */
const DailySummaryTable = ({ dailySummary = [], className = '' }) => {
  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('date', {
        header: 'Date',
        cell: (info) => {
          const value = info.getValue();
          if (value === 'TOTAL') return <span className="font-semibold">Total</span>;
          return format(parseISO(value), 'MMM dd, yyyy');
        },
        sortingFn: 'datetime',
      }),
      columnHelper.accessor('search_clicks', {
        header: 'Clicks',
        cell: (info) => {
          const value = info.getValue();
          return <span className={info.row.original.date === 'TOTAL' ? 'font-semibold' : ''}>
            {value?.toLocaleString() || 0}
          </span>;
        },
      }),
      columnHelper.accessor('phone_reveals', {
        header: 'Phone Reveals',
        cell: (info) => {
          const value = info.getValue();
          return <span className={info.row.original.date === 'TOTAL' ? 'font-semibold' : ''}>
            {value?.toLocaleString() || 0}
          </span>;
        },
      }),
      columnHelper.accessor('pdf_requests', {
        header: 'View PDF',
        cell: (info) => {
          const value = info.getValue();
          return <span className={info.row.original.date === 'TOTAL' ? 'font-semibold' : ''}>
            {value?.toLocaleString() || 0}
          </span>;
        },
      }),
      columnHelper.accessor('viewing_requests', {
        header: 'Viewing Requests',
        cell: (info) => {
          const value = info.getValue();
          return <span className={info.row.original.date === 'TOTAL' ? 'font-semibold' : ''}>
            {value?.toLocaleString() || 0}
          </span>;
        },
      }),
    ],
    []
  );

  // Calculate totals row
  const totalsRow = useMemo(() => {
    if (!dailySummary || dailySummary.length === 0) return null;

    const totals = dailySummary.reduce(
      (acc, day) => ({
        phone_reveals: acc.phone_reveals + (day.phone_reveals || 0),
        pdf_requests: acc.pdf_requests + (day.pdf_requests || 0),
        viewing_requests: acc.viewing_requests + (day.viewing_requests || 0),
        search_clicks: acc.search_clicks + (day.search_clicks || 0),
        enquiry_submissions: acc.enquiry_submissions + (day.enquiry_submissions || 0),
      }),
      {
        phone_reveals: 0,
        pdf_requests: 0,
        viewing_requests: 0,
        search_clicks: 0,
        enquiry_submissions: 0,
      }
    );

    return {
      date: 'TOTAL',
      ...totals,
    };
  }, [dailySummary]);

  // Prepare data: totals row + sorted daily data
  const data = useMemo(() => {
    if (!dailySummary || dailySummary.length === 0) return [];

    // Sort daily summary by date descending (newest first)
    const sortedDailySummary = [...dailySummary].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    // Return totals row first, then daily data
    return totalsRow ? [totalsRow, ...sortedDailySummary] : sortedDailySummary;
  }, [dailySummary, totalsRow]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [],
    },
  });

  // Empty state
  if (!dailySummary || dailySummary.length === 0) {
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
        <p className="text-sm text-gray-500">No statistics found for the selected date range.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={row.original.date === 'TOTAL' ? 'bg-muted/50 border-b-2' : ''}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DailySummaryTable;
