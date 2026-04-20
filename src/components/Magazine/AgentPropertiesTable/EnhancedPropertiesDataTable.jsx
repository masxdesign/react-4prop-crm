import React, { useEffect, useRef, useState, useCallback } from 'react';
import { flexRender } from '@tanstack/react-table';
import EnhancedPropertyDetails from './EnhancedPropertyDetails';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ShoppingCartIcon } from 'lucide-react';
import AdvertiserCard from '@/components/ui/AdvertiserCard';

const EnhancedPropertyRow = ({
  expandedRows,
  toggleRowExpansion,
  row,
  agentId,
  isContentLoading,
  isAdminViewing,
  viewingAgentNid,
  onOpenAdvertiserSheet
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
            <div className="max-h-[800px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <EnhancedPropertyDetails
                property={row.original}
                agentId={agentId}
                isContentLoading={isContentLoading && expandedRows.has(row.original.pid)}
                isAdminViewing={isAdminViewing}
                viewingAgentNid={viewingAgentNid}
                onOpenAdvertiserSheet={onOpenAdvertiserSheet}
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

  // Sheet state lifted to this level so it persists when rows collapse
  const [advertiserSheetState, setAdvertiserSheetState] = useState({
    isOpen: false,
    advertisers: [],
    advertisersLoading: false,
    advertisersError: null,
    getSubtypeLabels: () => [],
    renderPillsWithShowMore: () => null,
    onSelectAdvertiser: () => {}
  });

  const handleOpenAdvertiserSheet = useCallback((sheetData) => {
    setAdvertiserSheetState({
      isOpen: true,
      ...sheetData
    });
  }, []);

  const handleCloseAdvertiserSheet = useCallback(() => {
    setAdvertiserSheetState(prev => ({ ...prev, isOpen: false }));
  }, []);

  if (isEmpty) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No enhanced properties found for your department.</p>
      </div>
    );
  }

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
                  agentId={agentId}
                  isContentLoading={isContentLoading}
                  isAdminViewing={isAdminViewing}
                  viewingAgentNid={viewingAgentNid}
                  onOpenAdvertiserSheet={handleOpenAdvertiserSheet}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Advertiser Selection Sheet - lifted here so it persists when rows collapse */}
      <Sheet open={advertiserSheetState.isOpen} onOpenChange={(open) => !open && handleCloseAdvertiserSheet()}>
        <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCartIcon className="size-5" strokeWidth={1.5} />
              Available Advertisers for New Booking
            </SheetTitle>
            <SheetDescription>
              Select an advertiser to schedule a booking for this property
            </SheetDescription>
          </SheetHeader>

          {advertiserSheetState.advertisersLoading && (
            <div className="text-sm text-gray-500 py-8 text-center">Loading advertisers...</div>
          )}

          {advertiserSheetState.advertisersError && (
            <div className="text-sm text-red-500 py-8 text-center">Error loading advertisers</div>
          )}

          {advertiserSheetState.advertisers.length === 0 && !advertiserSheetState.advertisersLoading && (
            <div className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded">
              No advertisers available for this property type
            </div>
          )}

          {advertiserSheetState.advertisers.length > 0 && (
            <div className="space-y-4">
              {advertiserSheetState.advertisers.map((advertiser) => (
                <AdvertiserCard
                  key={advertiser.id}
                  advertiser={advertiser}
                  subtypeLabels={advertiserSheetState.getSubtypeLabels(advertiser.pstids)}
                  onBook={(selectedAdvertiser) => {
                    advertiserSheetState.onSelectAdvertiser(selectedAdvertiser);
                    handleCloseAdvertiserSheet();
                  }}
                  renderPillsWithShowMore={advertiserSheetState.renderPillsWithShowMore}
                  variant="stacked"
                />
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EnhancedPropertiesDataTable;