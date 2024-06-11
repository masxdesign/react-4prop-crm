import useLocalstorageState from '@/hooks/use-LocalstorageState'
import useTableState from '@/hooks/use-TableModel'
import { useSuspenseQuery } from '@tanstack/react-query'
import { functionalUpdate } from '@tanstack/react-router'
import { getCoreRowModel, makeStateUpdater, useReactTable } from '@tanstack/react-table'
import { useIsFirstRender } from '@uidotdev/usehooks'
import { get, isUndefined } from 'lodash'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const useTableSS = ({
    tableName,
    queryOptions,
    columns,
    state,
    meta,
    onSortingChange,
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange
}) => {
    const { data, pageCount, count } = useLoadData(queryOptions, state)

    const defaultColumnOrder = useMemo(() => columns.map((c) => c.id), [columns])
    const defaultColumnSizing = {}
    const defaultColumnVisibility = useMemo(() => Object.fromEntries(
        columns.map(({ id, ...rest }) => ([id, get(rest, 'meta.defaultVisibilty', true)]))
    ))

    const [columnOrder, setColumnOrder] = useLocalstorageState([tableName, 'order'], defaultColumnOrder)
    const [columnSizing, setColumnSizing] = useLocalstorageState([tableName, 'sizing'], defaultColumnSizing)
    const [columnVisibility, setColumnVisibility] = useLocalstorageState([tableName, 'visibility'], defaultColumnVisibility)

    const table = useReactTable({
        columns, 
        data, 
        meta: {
            ...meta,
            count,
            dataQueryKey: queryOptions.queryKey
        },
        state: {
            ...state,
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
        onGlobalFilterChange: _o(state.globalFilter, onGlobalFilterChange),
        onPaginationChange: _o(state.pagination, onPaginationChange),
        onColumnFiltersChange: _o(state.columnFilters, onColumnFiltersChange),
        onSortingChange: _o(state.sorting, onSortingChange),
        onColumnVisibilityChange: setColumnVisibility,
        columnResizeMode: 'onChange',
        onColumnOrderChange: setColumnOrder,
        onColumnSizingChange: setColumnSizing,
        getCoreRowModel: getCoreRowModel()
    })

    const isFirstRender = useIsFirstRender()
    
    useEffect(() => {

        if(!isFirstRender) {
            table.setColumnSizing(columnSizing)
            table.setColumnOrder(columnOrder)
        }

    }, [columns])

    return table
}

function _o (newValue, onChange) {
    return (fn) => onChange(functionalUpdate(fn, newValue))
}

function useLoadData (queryOptions, tableState) {
    const { pageSize } = tableState.pagination

    const queryOptions_ = useMemo(() => 
        functionalUpdate(queryOptions, tableState), 
        [queryOptions, tableState]
    )

    const { data } = useSuspenseQuery(queryOptions_)

    const [{ count }, data_] = data

    const pageCount = useMemo(() => Math.ceil(count / pageSize), [count, pageSize])

    return {
        data: data_,
        pageCount,
        count
    }
}

export default useTableSS