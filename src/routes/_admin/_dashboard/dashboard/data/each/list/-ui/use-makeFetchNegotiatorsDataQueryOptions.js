import { useCallback } from "react"
import { fetchSelectedNegotiatorsDataQueryOptions } from "@/api/fourProp"

const makeFetchNegotiatorsDataQueryOptions = ({ dataPool }) => {
    const fetchNegotiatorDataQueryOptions = useCallback(
        (selected) => fetchSelectedNegotiatorsDataQueryOptions({ 
          selected,
          dataPool
        }), 
        [dataPool.size]
    )

    return fetchNegotiatorDataQueryOptions
}

export default makeFetchNegotiatorsDataQueryOptions