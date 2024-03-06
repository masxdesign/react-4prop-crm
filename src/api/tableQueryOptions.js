import { queryOptions } from "@tanstack/react-query"
import { fetchNegotiators } from "./fourProp"
import { fetchClientsPagin } from "./api-fakeServer"

const tableQueryOptions = (dataset, tableState) => (
    queryOptions({ 
        queryKey: [dataset, tableState.columnFilters, tableState.sorting, tableState.pagination], 
        queryFn: () => {
            switch (dataset) {
                case 'each':
                    return fetchNegotiators(tableState)
                case 'clients':
                    return fetchClientsPagin(tableState)
                default:
                    throw new Error('Not found')
            }
        }, 
        staleTime: 60_000
    })
)

export default tableQueryOptions