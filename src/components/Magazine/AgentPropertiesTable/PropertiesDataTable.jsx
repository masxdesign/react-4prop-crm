import React, { useEffect, useRef } from 'react';
import { flexRender } from '@tanstack/react-table';
import PropertyDetails from './PropertyDetails';
import { cn } from '@/lib/utils';

const PropertyRow = ({ expandedRows, toggleRowExpansion, row, columns, agentId }) => {
  const topBarRef = useRef()
  const expanded = expandedRows.has(row.id)
  useEffect(() => {
    if (expanded && topBarRef.current) {
        topBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [expanded]);
  return (
    <React.Fragment>
      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleRowExpansion(row.id)}>
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className="relative px-3 py-2 whitespace-nowrap text-xs text-gray-900">
            <div ref={topBarRef} className='absolute -top-10'></div>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
      {expanded && (
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
  )
}

const PropertiesDataTable = ({ 
  table, 
  columns, 
  expandedRows, 
  toggleRowExpansion, 
  agentId, 
  isEmpty,
  className
}) => {
  const containerRef = useRef()

  return (
    <>
      <div ref={containerRef} className={cn("overflow-x-auto", className)}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 z-40 shadow-sm bg-gray-50">
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
          <tbody className="bg-white divide-y divide-slate-200">
            {table.getRowModel().rows.map((row) => {
              return (
                <PropertyRow 
                  key={row.id}
                  expandedRows={expandedRows} 
                  toggleRowExpansion={toggleRowExpansion}
                  row={row} 
                  columns={columns} 
                  agentId={agentId}
                />
              )
            })}
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