import { queryOptions } from "@tanstack/react-query"
import { fetchClients } from "./api-fakeServer"

const clientsQueryOptions = queryOptions({ 
    queryKey: ['clients'], 
    queryFn: fetchClients, staleTime: 60_000
})

export default clientsQueryOptions