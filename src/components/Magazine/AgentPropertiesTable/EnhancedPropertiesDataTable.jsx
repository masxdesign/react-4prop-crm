import React, { useEffect, useRef } from 'react';
import { flexRender } from '@tanstack/react-table';
import EnhancedPropertyDetails from './EnhancedPropertyDetails';
import { cn } from '@/lib/utils';

const EnhancedPropertyRow = ({
  expandedRows,
  toggleRowExpansion,
  row,
  columns,
  agentId,
  isContentLoading,
  table,
  isAdminViewing,
  viewingAgentNid
}) => {
  const scrollAnchorRef = useRef();
  const expanded = expandedRows.has(row.original.pid);
  
  useEffect(() => {
    if (expanded && scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [expanded]);

  return (
    <React.Fragment>
      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleRowExpansion(row.original.pid)}>
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className="relative px-3 py-2 whitespace-nowrap text-xs text-gray-900">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
      {expanded && (
        <tr>
          <td ref={scrollAnchorRef} colSpan={row.getVisibleCells().length} className="relative p-0 scroll-m-28">
            <div className="max-h-[800px] overflow-y-auto">
              <EnhancedPropertyDetails
                property={row.original}
                agentId={agentId}
                isContentLoading={isContentLoading && expandedRows.has(row.original.pid)}
                isAdminViewing={isAdminViewing}
                viewingAgentNid={viewingAgentNid}
              />
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

const EnhancedPropertiesDataTable = ({
  table,
  columns,
  expandedRows,
  toggleRowExpansion,
  agentId,
  isEmpty,
  isContentLoading,
  className,
  isAdminViewing,
  viewingAgentNid
}) => {
  const containerRef = useRef();

  return isEmpty ? (
    <div className="text-center py-8">
      <p className="text-gray-500">No enhanced properties found for your department.</p>
    </div>
  ) : (
    <div ref={containerRef} className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="sticky top-0 z-40 shadow-sm bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={cn(
                    `px-3 text-left cursor-pointer`, 
                    headerGroup.depth === 0 
                      ? 'py-2 text-xs bg-slate-200' 
                      : 'py-2 uppercase hover:bg-gray-100 text-xs font-medium text-gray-500 tracking-wider'
                  )}
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
        <tbody className="bg-white divide-y divide-slate-200">
          {table.getRowModel().rows.map((row) => {
            return (
              <EnhancedPropertyRow
                key={row.id}
                expandedRows={expandedRows}
                toggleRowExpansion={toggleRowExpansion}
                row={row}
                columns={columns}
                agentId={agentId}
                isContentLoading={isContentLoading}
                table={table}
                isAdminViewing={isAdminViewing}
                viewingAgentNid={viewingAgentNid}
              />
            );
          })}
        </tbody>
      </table>
    </div>

  )
};

export default EnhancedPropertiesDataTable;