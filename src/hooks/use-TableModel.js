import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table"
import { useMap } from "@uidotdev/usehooks"
import { flatten, uniqBy } from "lodash"
import useTableSS from "@/components/DataTableSS/use-TableSS"
import useRouteSearchStateUpdater from "./use-RouteSearchStateUpdater"

const clearAllFiltersAction = () => ({
    type: "FILTERS_ALL_CLEARED"
})

const changeGlobalFilterAction = (globalFilter, column) => ({
    type: "CHANGE_GLOBAL_FILTER",
    payload: globalFilter,
    meta: { column }
})

const changeFiltersAction = (columnFilters) => ({
    type: "CHANGE_FILTERS",
    payload: columnFilters,
})

const changeSortingAction = (sorting) => ({
    type: "CHANGE_SORTING",
    payload: sorting,
})

const changePageAction = (pageIndex, pageSize = null) => ({
    type: "CHANGE_PAGE",
    payload: pageIndex,
    meta: { pageSize },
})

const selectAction = (id) => ({
    type: "SELECT",
    payload: id
})

const deselectAction = (id) => ({
    type: "DESELECT",
    payload: id
})

const deselectAllAction = () => ({
    type: "DESELECT_ALL"
})

const routeSearchUpdateStateAction = (search) => ({
    type: "UPDATE_STATE_SEARCH",
    payload: search
})

export const initialState = {
    tableState: {
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [{ id: "created", desc: true }],
        columnFilters: [],
        globalFilter: { search: "", column: "email" }
    },
    selected: [],
}

const tableStateSlice = (state, action) => {
    const initialTableState = initialState.tableState

    switch (action.type) {
        case "UPDATE_STATE_SEARCH":
            const search = action.payload

            return {
                ...initialTableState,
                pagination: {
                    ...initialTableState.pagination,
                    pageIndex: search.page
                        ? search.page - 1
                        : initialTableState.pagination.pageIndex,
                    pageSize: search.perpage ?? initialTableState.pagination.pageSize,
                },
                sorting: search.sorting ?? initialTableState.sorting,
                columnFilters: search.columnFilters ?? initialTableState.columnFilters,
                globalFilter: search.globalFilter ?? initialTableState.globalFilter
            }
        case "FILTERS_ALL_CLEARED":
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    pageIndex: 0,
                },
                columnFilters: initialTableState.columnFilters,
                globalFilter: initialTableState.globalFilter
            }
        case "CHANGE_PERPAGE":
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    pageSize: action.payload,
                }
            }
        case "CHANGE_PAGE":
            const pageSize = action.meta.pageSize ?? state.pagination.pageSize
            const pageSizeChanged = state.pagination.pageSize !== pageSize

            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    pageIndex: pageSizeChanged ? 0 : action.payload,
                    pageSize
                }
            }
        case "RESET_PAGE":
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    pageIndex: 0,
                }
            }
        case "CHANGE_GLOBAL_FILTER":
            return {
                ...state,
                globalFilter: action.payload,
                pagination: {
                    ...state.pagination,
                    pageIndex: 0,
                }
            }
        case "CHANGE_FILTERS":
            return {
                ...state,
                columnFilters: action.payload,
                pagination: {
                    ...state.pagination,
                    pageIndex: 0,
                }
            }
        case "CHANGE_SORTING":
            return {
                ...state,
                sorting: action.payload,
                pagination: {
                    ...state.pagination,
                    pageIndex: 0,
                }
            }
    }
}

export const init =  (search) => ({
    ...initialState,
    tableState: tableStateSlice(null, routeSearchUpdateStateAction(search))
})

const tableReducer = (state, action) => {
    switch (action.type) {
        case "UPDATE_STATE_SEARCH":
        case "FILTERS_ALL_CLEARED":
        case "CHANGE_PERPAGE":
        case "CHANGE_PAGE":
            return {
                ...state,
                tableState: tableStateSlice(state.tableState, action)
            }
        case "CHANGE_FILTERS":
        case "CHANGE_GLOBAL_FILTER":
        case "CHANGE_SORTING":
        case "RESET_PAGE":
            return {
                ...state,
                tableState: tableStateSlice(state.tableState, action),
                selected: initialState.selected
            }
        case "DESELECT_ALL":
            return {
                ...state,
                selected: initialState.selected
            }
        case "DESELECT":
            return {
                ...state,
                selected: state.selected.filter((item) => item !== action.payload)
            }
        case "SELECT":
            return {
                ...state,
                selected: [
                    ...state.selected.filter((item) => item !== action.payload),
                    action.payload
                ]
            }
        default:
            throw new Error("invalid action")
    }
}

const useTableReducer = ({ initialSearch }) => {
    const [state, dispatch] = useReducer(tableReducer, initialSearch, init)

    const onPaginationChange = useCallback((newPagination) => {
        const { pageIndex, pageSize } = newPagination
        dispatch(changePageAction(pageIndex, pageSize))
    }, [])

    const onClearAllFilters = useCallback(() => {
        dispatch(clearAllFiltersAction())
    }, [])

    const onGlobalFilterChange = useCallback((newGlobalFilter) => {
        dispatch(changeGlobalFilterAction(newGlobalFilter))
    }, [])

    const onColumnFiltersChange = useCallback((newFilters) => {
        dispatch(changeFiltersAction(newFilters))
    }, [])

    const onSortingChange = useCallback((newSorting) => {
        dispatch(changeSortingAction(newSorting))
    }, [])
    
    const select = useCallback((item) => {
        dispatch(selectAction(item))
    }, [])
   
    const deselect = useCallback((item) => {
        dispatch(deselectAction(item))
    }, [])

    const deselectAll = useCallback(() => {
        dispatch(deselectAllAction())
    }, [])

    return {
        onPaginationChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
        onSortingChange,
        onClearAllFilters,
        select,
        deselect,
        deselectAll,
        state,
        dispatch
    }
}

const useTableModel = () => {
    const search = useSearch({ strict: false })

    const { 
        onPaginationChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
        onSortingChange,
        onClearAllFilters,
        select,
        deselect,
        deselectAll,
        state,
        dispatch
    } = useTableReducer({ initialSearch: search })

    const makeOnRowSelectionChange = useCallback((newRowSelectionUpdater, table) => {
        const newValue = functionalUpdate(newRowSelectionUpdater, table.getState().rowSelection)
        makeStateUpdater('rowSelection', table)(newRowSelectionUpdater)

        for(const row of table.getRowModel().rows) {
            const isSelected = state.selected.includes(row.original.id)
            const isSelectedRowSelection = newValue[row.index]

            if(isSelected && isSelectedRowSelection) continue
            if(!isSelected && !isSelectedRowSelection) continue

            if(isSelectedRowSelection) {
                select(row.original.id)
            } else {
                deselect(row.original.id)
            }
        }
    }, [state.selected])

    const updateRowSelectionWithSelectedState = useCallback((table) => {
        table.setRowSelection(
            Object.fromEntries(
                table.getRowModel().rows
                    .map((row) => ([
                        row.index, 
                        state.selected.includes(row.original.id)
                    ]))
            )
        )
    }, [state.selected])

    const isDirtyFilters = useMemo(() => (
        state.tableState.columnFilters !== initialState.tableState.columnFilters
            || state.tableState.globalFilter !== initialState.tableState.globalFilter
    ), [state.tableState.columnFilters, state.tableState.globalFilter])

    const model = { 
        dispatch,
        state,
        tableState: state.tableState,
        deselectAll,
        deselect,
        isDirtyFilters,
        onPaginationChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
        onSortingChange,
        onClearAllFilters,
        makeOnRowSelectionChange,
        updateRowSelectionWithSelectedState,
    }

    return model
}

// dont lead upon your own misunderstanding
useTableModel.use = {
    tableSS: ({ tableName, queryOptions, columns, meta }, tableModel) => {
        useRouteSearchStateUpdater({
            initialState: initialState.tableState,
            state: tableModel.tableState,
            routeStateMapFn: (p, q) => p(
                q("pagination.pageIndex", "page"),
                q("pagination.pageSize", "perpage"),
                q("sorting"),
                q("columnFilters"),
                q("globalFilter")
            ),
            onRouteSearchChange: (search) => tableModel.dispatch(routeSearchUpdateStateAction(search))
        })

        const table = useTableSS({ 
            tableName,
            queryOptions, 
            columns,
            state: tableModel.tableState,
            onSortingChange: tableModel.onSortingChange,
            onPaginationChange: tableModel.onPaginationChange,
            onColumnFiltersChange: tableModel.onColumnFiltersChange,
            onGlobalFilterChange: tableModel.onGlobalFilterChange,
            meta: {
                ...meta,
                selected: tableModel.state.selected
            }
        })

        table.setOptions((options) => ({
            ...options,
            onRowSelectionChange: (updater) => tableModel.makeOnRowSelectionChange(updater, table)
        }))
        
        useLayoutEffect(() => {
    
            tableModel.updateRowSelectionWithSelectedState(table)
    
        }, [table.options.data])

        return table
    },
    selection (tableModel, table) {
        const queryKeys = useMap()

        const queryClient = useQueryClient()

        useEffect(() => {

            queryKeys.set(
                tableModel.tableState.pagination.pageIndex, 
                table.options.meta.dataQueryKey
            )
        
        }, [table.options.data])

        const selection = useMemo(() => {
            const items = flatten(Array.from(queryKeys.values().map(queryKey => {

                const { data } = queryClient.getQueryState(queryKey)
    
                const [__, rows] = data
                
                return rows.map((row) => ({
                    ...row,
                    _queryKey: queryKey
                }))
    
            })))

            return uniqBy(items, 'id').filter(({ id }) => tableModel.state.selected.includes(id))

        }, [tableModel.state.selected])

        const onExcludedApply = (excluded) => {
            excluded.forEach((item) => {
                tableModel.deselect(item)
            })
            table.getRowModel().rows
                .filter(({ original }) => excluded.includes(original.id))
                .forEach((row) => {
                    row.toggleSelected()
                })
        }

        return { 
            selection,
            onExcludedApply
        }
    },
    findInfoById (id, table) {
        const info = useMemo(() => {
            const row = table.getRowModel().rows.find(({ original }) => `${id}` === `${original.id}`)
        
            if(!row) return
        
            const visibleCells = row.getVisibleCells()
            return visibleCells?.[0]?.getContext()
    
        }, [id, table.options.data])
        
        return info
    }
}

export default useTableModel
