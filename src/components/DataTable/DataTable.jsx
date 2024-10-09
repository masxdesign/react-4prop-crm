import {  useState } from 'react'
import { getCoreRowModel, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import DataTablePagination from '../DataTablePagination'
import DataTableToolbar from '../DataTableToolbar'
import { fuzzyFilter } from '@/utils/fuzzyFilterSortFn'
import { useListStore } from '@/store'
import DataTableDnd from '../DataTableDnd'

const DataTable = ({ tableName = 'DataTable', columns, data, initialVisibilty = {}, defaultColumnSizing = {}, meta = {} }) => {
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
        defaultColumn: {
            minSize: 60,
            maxSize: 800
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
            <DataTableToolbar 
                table={table} 
                onInputFilterChange={setGlobalFilter} 
                inputFilter={globalFilter} 
            />
            <div className='rounded-md border'>
                <DataTableDnd 
                    table={table} 
                    tableName={tableName}
                    defaultColumnSizing={defaultColumnSizing}
                />
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}

export default DataTable