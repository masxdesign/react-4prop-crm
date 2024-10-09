import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer } from "react"
import { queryOptions, useQueryClient } from "@tanstack/react-query"
import { functionalUpdate, makeStateUpdater } from "@tanstack/react-table"
import useTableSS, { useLoadData } from "@/components/DataTableSS/use-TableSS"
import useRouteSearchStateUpdater from "./use-RouteSearchStateUpdater"
import { useSearch } from "@tanstack/react-router"
import { fetchNegotiator } from "@/api/fourProp"
import { LOCALSTOR_TABLEMODAL_SELECTED } from "@/constants"
import numberWithCommas from "@/utils/numberWithCommas"
import isEqual from "lodash/isEqual"

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

const deselectManyAction = (ids) => ({
    type: "DESELECT_MANY",
    payload: ids
})

const selectManyAction = (ids) => ({
    type: "SELECT_MANY",
    payload: ids
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

const useMakeTableReducer = ({ defaultState, search }) => {
    const fun = useMemo(() => {
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
        
        const reducer = (state, action) => {
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
                        selected: state.selected.filter(item => item !== action.payload)
                    }
                case "DESELECT_MANY":
                    return {
                        ...state,
                        selected: state.selected.filter(item => !action.payload.includes(item))
                    }
                case "SELECT":
                    return {
                        ...state,
                        selected: [
                            ...state.selected.filter(item => item !== action.payload),
                            action.payload
                        ]
                    }
                case "SELECT_MANY":
                    return {
                        ...state,
                        selected: action.payload
                    }
                default:
                    throw new Error("invalid action")
            }
        }

        const initializer = (search) => {

            const initialStateFromSearch = reducer(
                defaultState, 
                routeSearchUpdateStateAction(search)
            )

            return initialStateFromSearch
        }

        const persist = {
            hydrate (search) {
                return {
                    ...initializer(search),
                    selected: JSON.parse(localStorage.getItem(LOCALSTOR_TABLEMODAL_SELECTED)) || defaultSelected
                }
            },
            saveSelected (selected) {
                localStorage.setItem(LOCALSTOR_TABLEMODAL_SELECTED, JSON.stringify(selected))
            }
        }

        return { reducer, persist }
    }, [])

    const [state, dispatch] = useReducer(fun.reducer, search, fun.persist.hydrate)

    useEffect(() => {
        fun.persist.saveSelected(state.selected)
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

    return [state, dispatch]
}

const useTableReducer = ({ defaultState }) => {
    const search = useSearch({ strict: false })

    const [state, dispatch] = useMakeTableReducer({ defaultState, search })

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

    const deselectMany = useCallback((items) => {
        dispatch(deselectManyAction(items))
    }, [])

    const selectMany = useCallback((items) => {
        dispatch(selectManyAction(items))
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
        deselectMany,
        selectMany,
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
        deselectMany,
        selectMany,
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

    const isDirtyFilters = useMemo(() => (
        state.tableState.columnFilters !== defaultState.tableState.columnFilters
            || state.tableState.globalFilter !== defaultState.tableState.globalFilter
    ), [state.tableState.columnFilters, state.tableState.globalFilter])

    const model = { 
        dispatch,
        state,
        tableState: state.tableState,
        deselectAll,
        deselectMany,
        selectMany,
        deselect,
        isDirtyFilters,
        onPaginationChange,
        onGlobalFilterChange,
        onColumnFiltersChange,
        onSortingChange,
        onClearAllFilters,
        makeOnRowSelectionChange
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
        const { tableName, dialogModel, components, services, staleTime, columns, meta, tableModel, dataPool, authUserId } = options

        const selected = tableModel.state.selected

        const tableQueryOptions = useTableQueryOptions({ tableName, queryFn: services.tableSSList, staleTime }, tableModel)

        const { data, pageCount, count } = useLoadData(tableQueryOptions, tableModel.tableState)

        const table = useTableSS({ 
            enableRowSelection: row => !isEqual(row.original.id, authUserId),
            tableName,
            queryOptions: tableQueryOptions, 
            columns,
            data,
            pageCount,
            state: tableModel.tableState,
            onSortingChange: tableModel.onSortingChange,
            onPaginationChange: tableModel.onPaginationChange,
            onColumnFiltersChange: tableModel.onColumnFiltersChange,
            onGlobalFilterChange: tableModel.onGlobalFilterChange,
            meta: {
                ...meta,
                dialogModel,
                authUserId,
                components,
                count,
                dataQueryKey: tableQueryOptions.queryKey,
                selected: tableModel.state.selected
            }
        })

        table.setOptions((options) => ({
            ...options,
            onRowSelectionChange: (updater) => tableModel.makeOnRowSelectionChange(updater, table)
        }))

        const updateRowSelectionWithSelectedState = useCallback(selected => {
            table.setRowSelection(
                Object.fromEntries(
                    table.getRowModel().rows
                        .map((row) => ([
                            row.index, 
                            selected.includes(row.original.id)
                        ]))
                )
            )
        }, [table])

        const countFormatted = useMemo(() => numberWithCommas(count), [count])

        const deselectMany = deselectIds => {
            tableModel.deselectMany(deselectIds)
        
            table.getRowModel().rows
                .filter(({ original }) => deselectIds.includes(original.id))
                .forEach((row) => {
                    row.toggleSelected()
                })
        }
        
        const selectMany = selectIds => {
            tableModel.selectMany(selectIds)
            updateRowSelectionWithSelectedState(selectIds)
        }

        useEffect(() => {

            table.options.data?.forEach(row => {

                if (dataPool.has(row.id)) return
                
                dataPool.set(row.id, row)

            })
        
        }, [table.options.data])
        
        useLayoutEffect(() => {
    
            updateRowSelectionWithSelectedState(tableModel.state.selected)
    
        }, [table.options.data])

        return { 
            table, 
            selected, 
            count, 
            countFormatted, 
            deselectMany, 
            selectMany 
        }

    },
    getResultFromTable ({ getResultFromTable, id }) {
        return useMemo(() => getResultFromTable(id), [getResultFromTable, id])
    },
    tableDialog ({ 
        tableSSModal, 
        renderMessages,
        services: {  
            tableDialog: { 
                getInfoById, 
                noteList, 
                addNote, 
                deleteNote 
            } 
        }
    }) {
        const queryClient = useQueryClient()

        const { table } = tableSSModal
        const { authUserId, dialogModel = null } = table.options.meta

        const getResultFromTable = useCallback(id => {

            if (!id) return null

            const row = table.getRowModel().rows.find(({ original }) => `${id}` === `${original.id}`)
        
            if (!row) return null
        
            const visibleCells = row.getVisibleCells()
            const info = visibleCells?.[0]?.getContext()

            return info

        }, [table.options.data])

        const id = dialogModel?.state.info

        const infoQueryOptions = queryOptions({
            queryKey: ['infoById', id],
            queryFn: () => getInfoById(id)
        })

        const chatboxQueryOptions = queryOptions({
            queryKey: ['dialogContent', authUserId, id],
            queryFn: () => noteList(id)
        })

        const addMutationOptions =  {
            mutationFn: (variables) => addNote(variables, { id, authUserId }),
            onSuccess: (data, variables) => {
                const { _button } = variables
                
                if(_button === 'bizchat') {
                    queryClient.invalidateQueries({ queryKey: ['bizchatMessagesLast5', authUserId] })
                }
                
                queryClient.invalidateQueries({ queryKey: chatboxQueryOptions.queryKey })
            }
        }

        /** experimental */
        const deleteMutationOptions = {
            mutationFn: deleteNote,
            onSuccess: (_, id) => {
                queryClient.setQueryData(chatboxQueryOptions.queryKey, util_delete_each({ id }))
            }
        }

        return {
            id,
            authUserId,
            infoQueryOptions,
            chatboxQueryOptions,
            addMutationOptions,
            deleteMutationOptions,
            getResultFromTable,
            renderMessages,
            table: tableSSModal.table,
            dialogModel: tableSSModal.table.options.meta.dialogModel,
            tableSSModal
        }
    }
}

export default useTableModel
