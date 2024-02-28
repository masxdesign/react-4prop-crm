import {  useEffect, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import DataTablePagination from '../DataTablePagination'
import DataTableToolbar from '../dataTableToolbar'
import { fuzzyFilter } from '@/utils/fuzzyFilterSortFn'
import { useListStore } from '@/store'
import DataTableDnd from '../DataTableDnd'

const DataTableSS = ({ 
    tableName = 'DataTable', 
    columns, 
    data, 
    initialVisibilty = {}, 
    defaultColumnSizing = {}, 
    sorting,
    pagination,
    columnFilters,
    onSortingChange,
    onPaginationChange,
    onColumnFiltersChange,
    pageCount,
    meta = {}
}) => {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState(initialVisibilty)
    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {

        console.log(sorting, columnFilters, globalFilter, pagination);

    }, [sorting, columnFilters, globalFilter, pagination])

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
            pagination
        },
        pageCount,
        defaultColumn: {
            minSize: 60,
            maxSize: 800
        },
        autoResetPageIndex: false,
        enableRowSelection: true,
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        onPaginationChange,
        onColumnFiltersChange,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        onSortingChange: (fn) => onSortingChange(fn(sorting)),
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel()
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

export default DataTableSS