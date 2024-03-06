import { queryOptions } from "@tanstack/react-query"
import { fetchNegotiators } from "./fourProp"
import { fetchClientsPagin } from "./api-fakeServer"

const tableQueryOptions = (dataset, { pagination, sorting, columnFilters }) => (
    queryOptions({ 
        queryKey: ['table', dataset, columnFilters, sorting, pagination], 
        queryFn: () => {
            const args = { columnFilters, sorting, pagination }
    
            switch (dataset) {
                case 'each':
                    return fetchNegotiators(args)
                case 'clients':
                    return fetchClientsPagin(args)
                default:
                    throw new Error('Not found')
            }
    
        }, 
        staleTime: 60_000
    })
)

export default tableQueryOptions