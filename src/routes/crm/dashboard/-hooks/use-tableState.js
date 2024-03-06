import tableQueryOptions from "@/api/tableQueryOptions"
import routeSearchMapping from "@/utils/routeSearchMapping"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useReducer } from "react"

export const initialState = {
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: "created", desc: true }],
    columnFilters: [],
}

export const init =  (search) => ({
    ...initialState,
    pagination: {
        ...initialState.pagination,
        pageIndex: search.page
            ? search.page - 1
            : initialState.pagination.pageIndex,
        pageSize: search.perpage ?? initialState.pagination.pageSize,
    },
    sorting: search.sorting ?? initialState.sorting,
    columnFilters: search.columnFilters ?? initialState.columnFilters,
})

const tableReducer = (state, action) => {
    switch (action.type) {
        case "CHANGE_PERPAGE":
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    pageSize: action.payload,
                },
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
                },
            }
        case "CHANGE_FILTERS":
            return {
                ...state,
                columnFilters: action.payload,
                pagination: {
                    ...state.pagination,
                    pageIndex: 0,
                },
            }
        case "CHANGE_SORTING":
            return {
                ...state,
                sorting: action.payload,
                pagination: {
                    ...state.pagination,
                    pageIndex: 0,
                },
            }
        default:
            throw new Error("invalid action")
    }
}

const changeFiltersAction = (payload) => ({
    type: "CHANGE_FILTERS",
    payload,
})

const changeSortingAction = (payload) => ({
    type: "CHANGE_SORTING",
    payload,
})

const changePageAction = (payload, pageSize = null) => ({
    type: "CHANGE_PAGE",
    payload,
    meta: { pageSize },
})

const useSyncRoute = (state) => {
    const navigate = useNavigate({ strict: false })

    useEffect(() => {
        navigate({
            search: (prev) => routeSearchMapping(initialState, state, prev, (p, q) =>
                p(
                    q("pagination.pageIndex", "page"),
                    q("pagination.pageSize", "perpage"),
                    q("sorting"),
                    q("columnFilters")
                )
            )
        })
    }, [state])
}

const useLoadData = (queryOptions, pageSize) => {
    const { data } = useSuspenseQuery(queryOptions)

    const [{ count }, data_] = data

    const pageCount = useMemo(() => Math.round(count / pageSize), [count, pageSize])

    return {
        data: data_,
        pageCount
    }
}

const useTableReducer = () => {
    const search = useSearch({ strict: false })
    
    const [state, dispatch] = useReducer(tableReducer, search, init)

    const onPaginationChange = useCallback((newPagination) => {
        const { pageIndex, pageSize } = newPagination
        dispatch(changePageAction(pageIndex, pageSize))
    }, [])

    const onColumnFiltersChange = useCallback((newFilters) => {
        dispatch(changeFiltersAction(newFilters))
    }, [])

    const onSortingChange = useCallback((newSorting) => {
        dispatch(changeSortingAction(newSorting))
    }, [])

    return {
        state,
        props: {
            ...state,
            onPaginationChange,
            onColumnFiltersChange,
            onSortingChange
        }
    }
}

const useTableState = ({ queryOptions }) => {

    const table = useTableReducer()

    const queryOptions_ = useMemo(() => (
        typeof queryOptions === "function" 
            ? queryOptions(table.state) 
            : queryOptions    
    ), [queryOptions, table.state])

    const { data, pageCount } = useLoadData(queryOptions_, table.state.pagination.pageSize)

    useSyncRoute(table.state)

    return { 
        ...table.props,
        data, 
        pageCount,
    }
}

export default useTableState
