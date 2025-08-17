import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import ScheduleStatus from './ScheduleStatus';
import { pluralize } from '../util/pluralize';

const columnHelper = createColumnHelper();

const ScheduleTableView = ({ schedules }) => {
  const columns = useMemo(() => [
    columnHelper.accessor('advertiser_company', {
      header: 'Advertiser',
      cell: (info) => (
        <div className="font-medium text-gray-900" title={`Advertiser ID: ${info.row.original.advertiser_id}`}>{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('period', {
      header: 'Period',
      cell: (info) => {
        const schedule = info.row.original;
        if (schedule.start_date && schedule.end_date && 
            typeof schedule.start_date === 'string' && typeof schedule.end_date === 'string') {
          return `${format(parseISO(schedule.start_date), 'MMM dd, yyyy')} - ${format(parseISO(schedule.end_date), 'MMM dd, yyyy')}`;
        }
        return 'N/A';
      },
    }),
    columnHelper.accessor('duration', {
      header: 'Duration',
      cell: (info) => {
        const schedule = info.row.original;
        
        if (schedule.week_no) {
          return pluralize(schedule.week_no, 'week', 'weeks');
        } else {
          return 'N/A';
        }
      }
    }),
    columnHelper.accessor('rate', {
      header: 'Rate',
      cell: (info) => {
        const schedule = info.row.original;
        
        if (schedule.week_no && schedule.fixed_week_rate) {
          return `£${schedule.fixed_week_rate}/week`;
        } else {
          return 'N/A';
        }
      },
    }),
    columnHelper.accessor('quote', {
      header: 'Quote',
      cell: (info) => {
        const schedule = info.row.original;
        const quote = schedule.quote || 0;
        return <span className="font-semibold text-green-600">£{quote.toFixed(2)}</span>;
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <ScheduleStatus schedule={info.row.original} />,
    })
  ], []);

  const table = useReactTable({
    data: schedules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="max-h-80 overflow-auto border rounded-md">
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center space-x-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted()] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-2 text-xs">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTableView;