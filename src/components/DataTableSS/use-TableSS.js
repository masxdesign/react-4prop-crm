import useLocalstorageState from '@/hooks/use-LocalstorageState'
import useTableState from '@/hooks/use-tableState'
import { functionalUpdate } from '@tanstack/react-router'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { get, isUndefined } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'

const useTableSS = ({
    tableName,
    queryOptions,
    columns,
    meta
}) => {
    const {
        data, 
        sorting,
        pageCount,
        pagination,
        columnFilters,
        onSortingChange,
        onPaginationChange,
        onColumnFiltersChange
    } = useTableState({ queryOptions })

    const defaultColumnOrder = useMemo(() => columns.map((c) => c.id), [columns])
    const defaultColumnSizing = {}
    const defaultColumnVisibility = useMemo(() => Object.fromEntries(
        columns.map(({ id, ...rest }) => ([id, get(rest, 'meta.defaultVisibilty', true)]))
    ))

    const [columnOrder, setColumnOrder] = useLocalstorageState([tableName, 'order'], defaultColumnOrder)
    const [columnSizing, setColumnSizing] = useLocalstorageState([tableName, 'sizing'], defaultColumnSizing)
    const [columnVisibility, setColumnVisibility] = useLocalstorageState([tableName, 'visibility'], defaultColumnVisibility)

    // const [rowSelection, setRowSelection] = useState({})

    const selectedIds = useMemo(() => new Set, [])

    console.log(selectedIds);

    const table = useReactTable({
        columns, 
        data, 
        meta: {
            ...meta,
            dataQueryKey: queryOptions.queryKey
        },
        state: {
            sorting,
            columnFilters,
            pagination,
            columnVisibility,
            columnOrder,
            columnSizing
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
        onColumnVisibilityChange: setColumnVisibility,
        columnResizeMode: 'onChange',
        onColumnOrderChange: setColumnOrder,
        onColumnSizingChange: setColumnSizing,
        getCoreRowModel: getCoreRowModel()
    })

    const onRowSelectionChange = (newValue) => {
        const newValue_ = functionalUpdate(newValue, table.getState().rowSelection)
        const rows = table.getRowModel().rows

        console.log(selectedIds);

        for(const row of rows) {
            if(newValue_[row.index]) {
                selectedIds.add(row.original.id)
            } else {
                selectedIds.delete(row.original.id)
            }
        }
        
    }

    table.setOptions((options) => ({
        ...options,
        onRowSelectionChange
    }))

    useEffect(() => {
        

        table.setRowSelection(
            Object.fromEntries(
                table.getRowModel().rows
                    .map((row) => ([row.index, selectedIds.has(row.original.id)]))
            )
        )

    }, [selectedIds.size])

    const isMountedRef = useRef()
    
    useEffect(() => {
        if(isMountedRef.current) {
            table.setColumnSizing(columnSizing)
            table.setColumnOrder(columnOrder)
        }
    }, [columns])

    useEffect(() => {
        isMountedRef.current = true
    }, [])

    return table
}

function _o (newValue, onChange) {
    return (fn) => onChange(functionalUpdate(fn, newValue))
}

export default useTableSS