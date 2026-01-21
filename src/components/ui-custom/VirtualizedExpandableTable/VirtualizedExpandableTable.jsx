import { useEffect, useRef, useState, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader2, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Virtualized table with infinite scrolling and expandable rows */
const VirtualizedExpandableTable = ({
  queryKey,
  queryFn,
  columns,
  getRowKey,
  pageSize = 20,
  estimateRowSize = 60,
  expandedRowHeight = 400,
  overscan = 5,
  maxHeight = '600px',
  minWidth = '1000px',
  emptyMessage = 'No data found',
  errorMessage = 'Error loading data',
  className,
  queryOptions = {},
  onTotalChange,
  renderExpandedContent,
  onRowExpand,
}) => {
  const parentRef = useRef(null)
  const [expandedRows, setExpandedRows] = useState(new Set())

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ cursor: pageParam, pageSize }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    ...queryOptions,
  })

  const allItems = data?.pages.flatMap((page) => page.data) ?? []
  const total = data?.pages[0]?.total

  useEffect(() => {
    if (total !== undefined && onTotalChange) {
      onTotalChange(total)
    }
  }, [total, onTotalChange])

  const toggleRowExpansion = useCallback((rowKey) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(rowKey)) {
        next.delete(rowKey)
      } else {
        next.add(rowKey)
        onRowExpand?.(rowKey)
      }
      return next
    })
  }, [onRowExpand])

  const isRowExpanded = useCallback((rowKey) => expandedRows.has(rowKey), [expandedRows])

  // Calculate row height dynamically based on expansion
  const getItemSize = useCallback((index) => {
    if (index >= allItems.length) return estimateRowSize // loader row
    const item = allItems[index]
    const rowKey = getRowKey(item)
    return isRowExpanded(rowKey) ? estimateRowSize + expandedRowHeight : estimateRowSize
  }, [allItems, getRowKey, isRowExpanded, estimateRowSize, expandedRowHeight])

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allItems.length + 1 : allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getItemSize,
    overscan,
  })

  // Fetch next page when scrolling near the end
  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()
    if (!lastItem) return

    if (
      lastItem.index >= allItems.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allItems.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ])

  // Force re-measure when expanded rows change
  useEffect(() => {
    rowVirtualizer.measure()
  }, [expandedRows, rowVirtualizer])

  const getColumnStyle = (col) => {
    const style = {}
    if (col.width) style.width = col.width
    if (col.minWidth) style.minWidth = col.minWidth
    if (col.flex) style.flex = col.flex
    return style
  }

  const getColumnClasses = (col) =>
    cn(
      col.align === 'center' && 'text-center',
      col.align === 'right' && 'text-right',
      col.className
    )

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-sm text-destructive', className)}>
        {errorMessage}
      </div>
    )
  }

  if (allItems.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-sm text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-x-auto border rounded-md min-w-0 w-full', className)}>
      <div
        ref={parentRef}
        className="overflow-y-auto bg-background"
        style={{ maxHeight, minWidth }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted sticky top-0 z-50">
          {/* Expand column header */}
          <div className="w-8 shrink-0" />
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn('text-xs font-medium text-muted-foreground', getColumnClasses(col))}
              style={getColumnStyle(col)}
            >
              {col.header}
            </div>
          ))}
        </div>

        {/* Virtualized rows */}
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const isLoaderRow = virtualRow.index > allItems.length - 1
            const item = allItems[virtualRow.index]
            const rowKey = isLoaderRow ? 'loader' : getRowKey(item)
            const expanded = !isLoaderRow && isRowExpanded(rowKey)

            return (
              <div
                key={rowKey}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="border-b"
              >
                {isLoaderRow ? (
                  <div className="flex items-center justify-center" style={{ height: estimateRowSize }}>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    {/* Main row */}
                    <div
                      className="flex items-center gap-2 px-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      style={{ height: estimateRowSize }}
                      onClick={() => toggleRowExpansion(rowKey)}
                    >
                      {/* Expand icon */}
                      <div className="w-8 shrink-0 flex items-center justify-center">
                        {expanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      {columns.map((col) => (
                        <div
                          key={col.key}
                          className={cn('text-sm', getColumnClasses(col))}
                          style={getColumnStyle(col)}
                        >
                          {col.render(item, { expanded, toggleExpansion: () => toggleRowExpansion(rowKey) })}
                        </div>
                      ))}
                    </div>
                    {/* Expanded content */}
                    {expanded && renderExpandedContent && (
                      <div
                        className="bg-muted/30 border-t overflow-auto"
                        style={{ height: expandedRowHeight }}
                      >
                        {renderExpandedContent(item)}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VirtualizedExpandableTable
