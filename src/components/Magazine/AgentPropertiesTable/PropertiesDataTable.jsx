import React from 'react';
import { flexRender } from '@tanstack/react-table';
import PropertyDetails from './PropertyDetails';
import { cn } from '@/lib/utils';

const PropertiesDataTable = ({ 
  table, 
  columns, 
  expandedRows, 
  toggleRowExpansion, 
  agentId, 
  isEmpty,
  className
}) => {
  return (
    <>
      <div className={cn("overflow-x-auto", className)}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 shadow-sm bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                    <td key={cell.id} className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {expandedRows.has(row.id) && (
                  <tr>
                    <td colSpan={columns.length} className="p-0">
                      <div className="max-h-[800px] overflow-y-auto">
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

      {isEmpty && (
        <div className="text-center py-8">
          <p className="text-gray-500">No properties found for your department.</p>
        </div>
      )}
    </>
  );
};

export default PropertiesDataTable;