import {  useEffect, useMemo, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import DataTablePagination from '../DataTablePagination'
import DataTableToolbar from '../dataTableToolbar'
import { fuzzyFilter } from '@/utils/fuzzyFilterSortFn'
import DataTableDnd from '../DataTableDnd'
import { get } from 'lodash'

const _o = (s, e) => (f) => e(typeof f === 'function' ? f(s) : f) 

const DataTableSS = ({ 
    tableName = 'DataTable', 
    columns, 
    data,  
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

    const defaultColumnVisibility = useMemo(() => (
        Object.fromEntries(
            columns.map(({ id, ...rest }) => ([id, get(rest, 'meta.defaultVisibilty', true)]))
        )
    ), [columns])

    const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility)
    
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState('')

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
        onPaginationChange: _o(pagination, onPaginationChange),
        onColumnFiltersChange: _o(columnFilters, onColumnFiltersChange),
        onSortingChange: _o(sorting, onSortingChange),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
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