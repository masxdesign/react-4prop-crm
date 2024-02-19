import {  useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { flexRender, getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import DataTablePagination from '../DataTablePagination'
import DataTableToolbar from '../dataTableToolbar'
import { fuzzyFilter } from '@/utils/fuzzyFilterSortFn'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '../ui/context-menu'
import { useListStore } from '@/store'

const DataTable = ({ columns, data, initialVisibilty = {}, meta = {} }) => {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState(initialVisibilty)
    const [columnFilters, setColumnFilters] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')

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
            globalFilter
        },
        autoResetPageIndex: false,
        enableRowSelection: true,
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

    return (
        <div className='space-y-4'>
            <DataTableToolbar table={table} onInputFilterChange={setGlobalFilter} inputFilter={globalFilter} />
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className={header.column.columnDef.meta?.className ?? ""} colSpan={header.colSpan}>
                                        {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={cell.column.columnDef.meta?.className ?? ""}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                // <ContextMenu key={row.id}>
                                //     <ContextMenuTrigger asChild>         
                                //         <TableRow
                                //             data-state={row.getIsSelected() && "selected"}
                                //         >
                                //             {row.getVisibleCells().map((cell) => (
                                //                 <TableCell key={cell.id} className={cell.column.columnDef.meta?.className ?? ""}>
                                //                     {flexRender(
                                //                         cell.column.columnDef.cell,
                                //                         cell.getContext()
                                //                     )}
                                //                 </TableCell>
                                //             ))}
                                //         </TableRow>
                                //     </ContextMenuTrigger>
                                //     <ContextMenuContent>
                                //         <ContextMenuItem>Profile</ContextMenuItem>
                                //         <ContextMenuItem>Billing</ContextMenuItem>
                                //         <ContextMenuItem>Team</ContextMenuItem>
                                //         <ContextMenuItem>Subscription</ContextMenuItem>
                                //     </ContextMenuContent>
                                // </ContextMenu>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}

export default DataTable