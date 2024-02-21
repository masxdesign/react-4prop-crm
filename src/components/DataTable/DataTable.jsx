import {  useCallback, useEffect, useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import DataTablePagination from '../DataTablePagination'
import DataTableToolbar from '../dataTableToolbar'
import { fuzzyFilter } from '@/utils/fuzzyFilterSortFn'
import { useListStore } from '@/store'
import { memo } from 'react'
import { cn } from '@/lib/utils'
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'

const DraggableTableHeader = ({ header }) => {
    const { 
        attributes, 
        isDragging, 
        listeners, 
        setNodeRef, 
        transform 
    } = useSortable({ id: header.column.id })

    return (
        <TableHead 
            ref={setNodeRef}
            className={cn('group relative flex items-center whitespace-nowrap', header.column.columnDef.meta?.className ?? "", isDragging ? "opacity-80 z-10": "opacity-100 z-0")} 
            colSpan={header.colSpan}
            style={{
                width: `calc(var(--header-${header?.id}-size) * 1px)`,
                transform: CSS.Translate.toString(transform),
                transition: 'width transform 0.2s ease-in-out'
            }}
        >
            {header.isPlaceholder
            ? null
            : flexRender(
                header.column.columnDef.header,
                header.getContext()
            )}
            <button {...attributes} {...listeners}>
                🟰
            </button>
            <div
                onDoubleClick={() => header.column.resetSize()}
                onMouseDown={header.getResizeHandler()}
                onTouchStart={header.getResizeHandler()}
                className={cn('group-hover:opacity-100 opacity-0 rounded-lg absolute top-3 bottom-3 right-0 w-[5px] cursor-col-resize select-none touch-none', header.column.getIsResizing() ? 'bg-sky-600 opacity-100' : 'bg-slate-400 group-hover:opacity-50')}
            />
        </TableHead>
    )
}

const DragAlongCell = ({ cell }) => {
    const { isDragging, setNodeRef, transform } = useSortable({ id: cell.column.id })

    return (
        <TableCell  
            ref={setNodeRef}
            className={cn("relative flex items-center", cell.column.columnDef.meta?.className ?? "", isDragging ? "opacity-80 z-10": "opacity-100 z-0")}
            style={{
                width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                transform: CSS.Translate.toString(transform),
                transition: 'width transform 0.2s ease-in-out'
            }}
        >
            {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
            )}
        </TableCell>
    )
}

const DataTableBody = ({ table }) => (
    <TableBody>
        {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="flex items-center w-[fit-content]"
                >
                    <SortableContext
                        items={table.getState().columnOrder}
                        strategy={horizontalListSortingStrategy}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <DragAlongCell key={cell.id} cell={cell} />
                        ))}
                    </SortableContext>
                </TableRow>                              
            ))
        ) : (
            <TableRow className="flex items-center w-[fit-content]">
                <TableCell
                    colSpan={columns.length}
                    className="flex items-center h-24 text-center"
                >
                    No results.
                </TableCell>
            </TableRow>
        )}
    </TableBody>
)

const MemoizedTableBody = memo(
    DataTableBody,
    (prev, next) => prev.table.options.data === next.table.options.data
)

const useLocalstorageState = (keyName, initialState) => {
    const [state, setState] = useState(() => {
        const data = localStorage.getItem(keyName)
        if(!data) {
            const initialState_ = typeof initialState === 'function' ? initialState() : initialState
            localStorage.setItem(keyName, JSON.stringify(initialState_))
            return initialState_
        }
        return JSON.parse(data)
    })

    const setState_ = useCallback((newState) => {
        let newState_ = typeof newState === 'function' ? newState(state) : newState
        setState(newState_)
        localStorage.setItem(keyName, JSON.stringify(newState_))
    }, [state])

    return [state, setState_]
}

const DataTable = ({ tableName = 'DataTable', columns, data, initialVisibilty = {}, defaultColumnSizing = {}, meta = {} }) => {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState(initialVisibilty)
    const [columnFilters, setColumnFilters] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [columnSizing, setColumnSizing] = useLocalstorageState(tableName, defaultColumnSizing)
    const [columnSizingInfo, setColumnSizingInfo] = useState({})
    const [columnOrder, setColumnOrder] = useState(() => columns.map((c) => c.id))

    const sorting = useListStore.use.sorting()
    const setSorting = useListStore.use.setSorting()
 
    const table = useReactTable({
        columns, 
        data, 
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        meta,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
            columnSizing,
            columnSizingInfo,
            columnOrder
        },
        defaultColumn: {
            minSize: 60,
            maxSize: 800
        },
        columnResizeMode: 'onChange',
        autoResetPageIndex: false,
        enableRowSelection: true,
        onColumnOrderChange: setColumnOrder,
        onColumnSizingInfoChange: setColumnSizingInfo,
        onColumnSizingChange: setColumnSizing,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        onSortingChange: (fn) => setSorting(fn(sorting)),
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    const columnSizeVars = useMemo(() => {
        const headers = table.getFlatHeaders()
        const colSizes = {}
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i]
          colSizes[`--header-${header.id}-size`] = header.getSize()
          colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
        }
        return colSizes
    }, [columnSizingInfo])

    // reorder columns after drag & drop
    const handleDragEnd = (e) => {
        const { active, over } = e
        if (active && over && active.id !== over.id) {
            setColumnOrder(columnOrder => {
                const oldIndex = columnOrder.indexOf(active.id)
                const newIndex = columnOrder.indexOf(over.id)
                return arrayMove(columnOrder, oldIndex, newIndex)
            })
        }
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    )

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >            
            <div className='space-y-4'>
                <DataTableToolbar table={table} onInputFilterChange={setGlobalFilter} inputFilter={globalFilter} />
                <div className='rounded-md border'>
                    <Table 
                        style={{
                            ...columnSizeVars,
                            width: table.getTotalSize()
                        }}
                    >
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="flex items-center w-[fit-content]">
                                    <SortableContext
                                        items={columnOrder}
                                        strategy={horizontalListSortingStrategy}
                                    >                                
                                        {headerGroup.headers.map((header) => (
                                            <DraggableTableHeader key={header.id} header={header} />
                                        ))}
                                    </SortableContext>
                                </TableRow>
                            ))}
                        </TableHeader>
                        {table.getState().columnSizingInfo.isResizingColumn ? (
                            <MemoizedTableBody table={table} />
                        ) : (
                            <DataTableBody table={table} />
                        )}
                    </Table>
                </div>
                <DataTablePagination table={table} />
            </div>
        </DndContext>
    )
}

export default DataTable