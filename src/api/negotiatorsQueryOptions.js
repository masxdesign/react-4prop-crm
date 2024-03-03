import { queryOptions } from "@tanstack/react-query"
import { fetchNegotiators } from "./fourProp"

const negotiatorsQueryOptions = ({ pagination, sorting, columnFilters }) => queryOptions({ 
    queryKey: ['negotiators', columnFilters, sorting, pagination.pageSize, pagination.pageIndex], 
    queryFn: fetchNegotiators, 
    staleTime: 60_000
})

export default negotiatorsQueryOptions