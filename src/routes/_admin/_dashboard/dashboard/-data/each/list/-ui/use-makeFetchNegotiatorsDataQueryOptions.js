import { useCallback } from "react"
import { fetchSelectedNegotiatorsDataQueryOptions } from "@/api/fourProp"

const useMakeFetchNegotiatorsDataQueryOptions = ({ dataPool }) => {
    const fetchNegotiatorDataQueryOptions = useCallback(
        (selected) => fetchSelectedNegotiatorsDataQueryOptions({ 
          selected,
          dataPool
        }), 
        [dataPool.size]
    )

    return fetchNegotiatorDataQueryOptions
}

export default useMakeFetchNegotiatorsDataQueryOptions