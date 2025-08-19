import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import ScheduleStatus from './ScheduleStatus';
import ScheduleActionButtons from '../ui/ScheduleActionButtons';
import WorkflowTimeline from '../ui/WorkflowTimeline';
import useUsersByNids from '@/hooks/useUsersByNids';
import { formatDateRange } from '../util/formatDateRange';
import { pluralize } from '../util/pluralize';

const columnHelper = createColumnHelper();

const ScheduleTableView = ({ schedules, propertyId }) => {
  // Extract all unique NIDs for batch user fetching
  const allNids = useMemo(() => {
    const nids = [];
    schedules.forEach(schedule => {
      if (schedule.agent_id) nids.push(schedule.agent_id); // Creator
      if (schedule.approver_id) nids.push(schedule.approver_id);
      if (schedule.payer_id) nids.push(schedule.payer_id);
    });
    return [...new Set(nids)];
  }, [schedules]);

  // Fetch user data for all NIDs
  const { getUserByNid, isLoading: usersLoading } = useUsersByNids(allNids);

  const columns = useMemo(() => [
    columnHelper.accessor('advertiser_company', {
      header: 'Advertiser',
      cell: (info) => (
        <div className="font-medium text-gray-900" title={`Advertiser ID: ${info.row.original.advertiser_id}`}>{info.getValue()}</div>
      ),
      size: 120,
      minSize: 120,
      maxSize: 120,
    }),
    columnHelper.accessor('period', {
      header: 'Period',
      cell: (info) => {
        const schedule = info.row.original;
        if (schedule.start_date && schedule.end_date) {
          return formatDateRange(schedule.start_date, schedule.end_date);
        }
        return 'N/A';
      },
      size: 120,
      minSize: 120,
      maxSize: 120,
    }),
    columnHelper.accessor('quote', {
      header: 'Quote',
      cell: (info) => {
        const schedule = info.row.original;
        const quote = schedule.quote || 0;
        const duration = schedule.week_no ? pluralize(schedule.week_no, 'week', 'weeks') : 'N/A';
        const rate = schedule.week_no && schedule.fixed_week_rate ? `£${schedule.fixed_week_rate}/week` : 'N/A';
        
        return (
          <div className="text-xs">
            <div className="font-semibold text-green-600">£{quote.toFixed(2)}</div>
            <div className="text-gray-500">{duration} • {rate}</div>
          </div>
        );
      },
      size: 120,
      minSize: 120,
      maxSize: 120,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <ScheduleStatus schedule={info.row.original} />,
      size: 120,
      minSize: 120,
      maxSize: 120,
    }),
    columnHelper.accessor('workflow', {
      header: 'Workflow',
      cell: (info) => {
        const schedule = info.row.original;
        return (
          <WorkflowTimeline 
            schedule={schedule}
            getUserByNid={getUserByNid}
          />
        );
      },
      enableSorting: false,
      size: 180,
      minSize: 180,
      maxSize: 180,
    }),
    columnHelper.accessor('actions', {
      header: 'Actions',
      cell: (info) => (
        <ScheduleActionButtons 
          schedule={info.row.original} 
          propertyId={propertyId}
        />
      ),
      enableSorting: false,
      size: 120,
      minSize: 120,
      maxSize: 120,
    })
  ], [propertyId, getUserByNid]);

  const table = useReactTable({
    data: schedules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: 'onChange',
    enableColumnResizing: false,
  });

  return (
    <div className="max-h-[700px] overflow-auto border rounded-md">
      <table className="w-full" style={{ minWidth: 870 }}>
        <thead className="bg-gray-50 sticky top-0 shadow-sm z-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 align-top"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: `${header.getSize()}px` }}
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
                  <td 
                    key={cell.id} 
                    className="px-2 py-2 text-xs align-top"
                    style={{ width: `${cell.column.getSize()}px` }}
                  >
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