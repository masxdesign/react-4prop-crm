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

const columnHelper = createColumnHelper();

const ScheduleTableView = ({ schedules }) => {
  const columns = useMemo(() => [
    columnHelper.accessor('advertiser_company', {
      header: 'Advertiser',
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900">{info.getValue()}</div>
          <div className="text-xs text-gray-500">ID: {info.row.original.advertiser_id}</div>
        </div>
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
        
        if (schedule.week_no && schedule.fixed_week_rate) {
          return `${schedule.week_no} week${schedule.week_no !== 1 ? 's' : ''}`;
        } else {
          if (schedule.end_date && schedule.start_date && 
              typeof schedule.end_date === 'string' && typeof schedule.start_date === 'string') {
            const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
            return `${days} days`;
          }
          return 'N/A';
        }
      },
    }),
    columnHelper.accessor('rate', {
      header: 'Rate',
      cell: (info) => {
        const schedule = info.row.original;
        
        if (schedule.week_no && schedule.fixed_week_rate) {
          return `£${schedule.fixed_week_rate}/week`;
        } else {
          return `£${schedule.fixed_day_rate}/day`;
        }
      },
    }),
    columnHelper.accessor('total_price', {
      header: 'Total Price',
      cell: (info) => {
        const schedule = info.row.original;
        let totalPrice;
        
        if (schedule.week_no && schedule.fixed_week_rate) {
          totalPrice = schedule.total_revenue || (schedule.fixed_week_rate * schedule.week_no);
        } else {
          if (schedule.end_date && schedule.start_date && 
              typeof schedule.end_date === 'string' && typeof schedule.start_date === 'string') {
            const days = Math.ceil((parseISO(schedule.end_date) - parseISO(schedule.start_date)) / (1000 * 60 * 60 * 24));
            totalPrice = schedule.fixed_day_rate * days;
          } else {
            totalPrice = 0;
          }
        }
        
        return <span className="font-semibold text-green-600">£{totalPrice.toFixed(2)}</span>;
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