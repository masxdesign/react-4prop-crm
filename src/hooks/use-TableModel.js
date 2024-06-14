import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer } from "react"
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table"
import { useMap } from "@uidotdev/usehooks"
import { flatten, uniqBy } from "lodash"
import useTableSS from "@/components/DataTableSS/use-TableSS"
import useRouteSearchStateUpdater from "./use-RouteSearchStateUpdater"
import { useSearch } from "@tanstack/react-router"
import { fetchNegotiator, fetchNegotiatorByNids } from "@/api/fourProp"
import { LOCALSTOR_TABLEMODAL_SELECTED } from "@/constants"

const defaultSelected = []

export const defaultTableModelState = {
    tableState: {
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [{ id: "created", desc: true }],
        columnFilters: [],
        globalFilter: { search: "", column: "email" }
    },
    selected: defaultSelected,
}

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

export const routeSearchUpdateStateAction = (search) => ({
    type: "UPDATE_STATE_SEARCH",
    payload: search
})

export const tableStateReceived = (newTableState) => ({
    type: "TABLE_STATE_RECEIVED",
    payload: newTableState
})

const useMakeTableReducer = ({ defaultState }) => {
    const reducer = useMemo(() => {
        const tableStateSlice = (state, action) => {
            const defaultTableState = defaultState.tableState
        
            switch (action.type) {
                case "UPDATE_STATE_SEARCH":
                    const search = action.payload
        
                    return {
                        ...defaultTableState,
                        pagination: {
                            ...defaultTableState.pagination,
                            pageIndex: search.page
                                ? search.page - 1
                                : defaultTableState.pagination.pageIndex,
                            pageSize: search.perpage ?? defaultTableState.pagination.pageSize,
                        },
                        sorting: search.sorting ?? defaultTableState.sorting,
                        columnFilters: search.columnFilters ?? defaultTableState.columnFilters,
                        globalFilter: search.globalFilter ?? defaultTableState.globalFilter
                    }
                case "FILTERS_ALL_CLEARED":
                    return {
                        ...state,
                        pagination: {
                            ...state.pagination,
                            pageIndex: 0,
                        },
                        columnFilters: defaultTableState.columnFilters,
                        globalFilter: defaultTableState.globalFilter
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
        
        const mainReducer = (state, action) => {
            switch (action.type) {
                case "TABLE_STATE_RECEIVED":
                    return {
                        ...state,
                        tableState: action.payload
                    }
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
                        // selected: defaultState.selected
                    }
                case "DESELECT_ALL":
                    return {
                        ...state,
                        selected: defaultState.selected
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

        const initializer = (search) => {

            const initialStateFromSearch = mainReducer(
                defaultState, 
                routeSearchUpdateStateAction(search)
            )

            return {
                ...initialStateFromSearch,
                selected: JSON.parse(localStorage.getItem(LOCALSTOR_TABLEMODAL_SELECTED)) || defaultSelected
            }
        }

        return [mainReducer, initializer]
    })

    return reducer
} 

const useTableReducer = ({ defaultState }) => {
    const search = useSearch({ strict: false })
    const [tableReducer, initializer] = useMakeTableReducer({ defaultState })
    const [state, dispatch] = useReducer(tableReducer, search, initializer)

    useEffect(() => {
        localStorage.setItem(LOCALSTOR_TABLEMODAL_SELECTED, JSON.stringify(state.selected))
    }, [state.selected])

    useRouteSearchStateUpdater({
        defaultState: defaultState.tableState,
        state: state.tableState,
        routeStateMapFn: (p, q) => p(
            q("pagination.pageIndex", "page"),
            q("pagination.pageSize", "perpage"),
            q("sorting"),
            q("columnFilters"),
            q("globalFilter")
        ),
        onRouteSearchChange: (search) => dispatch(routeSearchUpdateStateAction(search))
    })

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

const useTableModel = ({ defaultState }) => {
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
    } = useTableReducer({ defaultState })

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
        state.tableState.columnFilters !== defaultState.tableState.columnFilters
            || state.tableState.globalFilter !== defaultState.tableState.globalFilter
    ), [state.tableState.columnFilters, state.tableState.globalFilter])

    const model = { 
        dispatch,
        state,
        defaultState,
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

const useTableQueryOptions = ({ tableName, queryFn, staleTime = 60_000 }, tableModel) => {
    const { tableState } = tableModel

    const queryOptions_ = useMemo(() => queryOptions({ 
        queryKey: [tableName, tableState.globalFilter, tableState.columnFilters, tableState.sorting, tableState.pagination], 
        queryFn: () => queryFn(tableState), 
        staleTime
    }), [tableName, tableState, queryFn, staleTime])

    return queryOptions_
}

useTableModel.use = {
    tableSS (options) {
        const { tableName, queryFn, staleTime, columns, meta, tableModel } = options

        const selected = tableModel.state.selected

        const tableQueryOptions = useTableQueryOptions({ tableName, queryFn, staleTime }, tableModel)
        const dataPool = useMap()

        const table = useTableSS({ 
            tableName,
            queryOptions: tableQueryOptions, 
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

        useEffect(() => {

            table.options.data?.forEach(row => {

                if (dataPool.has(row.id)) return
                
                dataPool.set(row.id, row)

            })
        
        }, [table.options.data])

        table.setOptions((options) => ({
            ...options,
            onRowSelectionChange: (updater) => tableModel.makeOnRowSelectionChange(updater, table)
        }))
        
        useLayoutEffect(() => {
    
            tableModel.updateRowSelectionWithSelectedState(table)
    
        }, [table.options.data])

        const fetchSelectedDataQueryOptions = useMemo(() =>
            queryOptions({
                queryKey: ['fetchSelectedData', selected],
                queryFn: async () => {

                    const nidsToFetch = selected.filter(id => !dataPool.has(id))
    
                    const fetched = await fetchNegotiatorByNids(nidsToFetch)
    
                    for(const item of fetched) {
                        dataPool.set(item.id, item)
                    }
    
                    return selected.map(id => dataPool.get(id))
                }
            }), 
            [selected, dataPool.size]
        )

        return { table, dataPool, tableModel, selected, fetchSelectedDataQueryOptions }
    },
    findResultFromTableById ({ id, table }) {
        const result = useMemo(() => {
            const row = table.getRowModel().rows.find(({ original }) => `${id}` === `${original.id}`)
        
            if(!row) return
        
            const visibleCells = row.getVisibleCells()
            const info = visibleCells?.[0]?.getContext()

            return info
    
        }, [id, table.options.data])

        return result
    },
    fetchResultByIdQueryOption (id) {
        return queryOptions({
            queryKey: ['fetchResultByIdQueryOption', id],
            queryFn: () => fetchNegotiator(id)
        })
    }
}

export default useTableModel
