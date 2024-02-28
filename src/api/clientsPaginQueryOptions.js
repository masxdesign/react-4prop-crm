import { queryOptions } from "@tanstack/react-query"
import { fetchClientsPagin } from "./api-fakeServer"

const clientsPaginQueryOptions = ({ pagination, sorting, columnFilters }) => queryOptions({ 
    queryKey: ['clients', pagination, sorting, columnFilters], 
    queryFn: fetchClientsPagin, 
    staleTime: 60_000,
    keepPreviousData: true
})

export default clientsPaginQueryOptions