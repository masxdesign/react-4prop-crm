import routeSearchMapping from "@/utils/routeSearchMapping"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useReducer } from "react"

const initialTableState = {
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: "created", desc: true }],
    columnFilters: [],
}

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
            return {
                ...state,
                pagination: {
                    ...state.pagination,
                    pageIndex: action.payload,
                    pageSize: action.meta.pageSize ?? state.pagination.pageSize,
                },
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

const useTableState = ({ search, queryOptionsFn }) => {
    const navigate = useNavigate()

    const [state, dispatch] = useReducer(
        tableReducer,
        initialTableState,
        (state) => ({
            ...state,
            pagination: {
                ...state.pagination,
                pageIndex: search.page
                    ? search.page - 1
                    : state.pagination.pageIndex,
                pageSize: search.perpage ?? state.pagination.pageSize,
            },
            sorting: search.sorting ?? state.sorting,
            columnFilters: search.columnFilters ?? state.columnFilters,
        })
    )

    const queryOptions = queryOptionsFn(state)

    const { data } = useSuspenseQuery(queryOptions)

    const [{ count }, data_] = data

    const { pageSize } = state.pagination

    const pageCount = useMemo(() => Math.round(count / pageSize), [count, pageSize])

    const onPaginationChange = (newPagination) => {
        const { pageIndex, pageSize } = newPagination
        dispatch(changePageAction(pageIndex, pageSize))
    }

    const onColumnFiltersChange = (newFilters) => {
        dispatch(changeFiltersAction(newFilters))
    }

    const onSortingChange = (newSorting) => {
        dispatch(changeSortingAction(newSorting))
    }

    useEffect(() => {
        navigate({
            search: (prev) =>
                routeSearchMapping(state, prev, (p, q) =>
                    p(
                        q("pagination.pageIndex", "page"),
                        q("pagination.pageSize", "perpage"),
                        q("sorting"),
                        q("columnFilters")
                    )
                ),
        })
    }, [state])

    return {
        tableProps: {
            ...state,
            pageCount,
            data: data_,
            onPaginationChange,
            onColumnFiltersChange,
            onSortingChange
        },
        queryOptions
    }
}

export default useTableState
