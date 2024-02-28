import {  useMemo, memo } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { flexRender } from '@tanstack/react-table'
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import { DragHandleHorizontalIcon } from '@radix-ui/react-icons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import useLocalstorageState from '@/hooks/use-LocalstorageState'

const ResizeHandler = ({ header }) => (
    <div
        onDoubleClick={() => header.column.resetSize()}
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={cn('absolute right-0 top-0 bottom-0 group-hover:opacity-100 opacity-0 rounded-lg h-full w-[5px] cursor-col-resize select-none touch-none', header.column.getIsResizing() ? 'bg-sky-600 opacity-100' : 'bg-slate-400 group-hover:opacity-50')}
    />
)

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
            className={cn(
                'group relative flex items-center whitespace-nowrap', 
                header.column.columnDef.meta?.className ?? "", 
                isDragging ? "opacity-80 z-10": "opacity-100 z-0"
            )} 
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
            <button 
                className='absolute bottom-0 left-1/2 -ml-2 group-hover:opacity-100 opacity-0 cursor-grab' 
                {...attributes} 
                {...listeners}
            >
                <DragHandleHorizontalIcon className='h-4 w-4' />
            </button>
            <ResizeHandler header={header} />
        </TableHead>
    )
}

const DragAlongCell = ({ cell }) => {
    const { isDragging, setNodeRef, transform } = useSortable({ id: cell.column.id })

    return (
        <TableCell  
            ref={setNodeRef}
            className={cn(
                "relative flex items-center", 
                cell.column.columnDef.meta?.className ?? "", 
                isDragging ? "opacity-80 z-10": "opacity-100 z-0"
            )}
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
            <TableRow>
                <TableCell
                    colSpan={table.options.columns.length}
                    className="items-center h-24 text-center"
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

const DataTableDnd = ({ tableName, table, defaultColumnSizing = {} }) => {

    const [columnSizing, setColumnSizing] = useLocalstorageState([tableName, 'sizing'], defaultColumnSizing)
    const [columnOrder, setColumnOrder] = useLocalstorageState([tableName, 'order'], () => table.options.columns.map((c) => c.id))

    table.setOptions((options) => ({
        ...options,
        state: {
            ...options.state,
            columnSizing,
            columnOrder
        },
        columnResizeMode: 'onChange',
        onColumnOrderChange: setColumnOrder,
        onColumnSizingChange: setColumnSizing
    }))

    const columnSizeVars = useMemo(() => {
        const headers = table.getFlatHeaders()
        const colSizes = {}
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i]
          colSizes[`--header-${header.id}-size`] = header.getSize()
          colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
        }
        return colSizes
    }, [table.getState().columnSizingInfo])

    // reorder columns after drag & drop
    const handleDragEnd = (e) => {
        const { active, over } = e
        if (active && over && active.id !== over.id) {
            table.setColumnOrder(columnOrder => {
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
        </DndContext>
    )
}

export default DataTableDnd