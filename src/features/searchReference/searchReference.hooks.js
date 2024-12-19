import { useAuth } from "@/components/Auth/Auth-context"
import { searchReferenceListingEnquiredQuery } from "./searchReference.queries"
import { useSuspenseQuery } from "@tanstack/react-query"

const useSearchReferenceListingEnquired = () => {
    const auth = useAuth()
    return useSuspenseQuery(searchReferenceListingEnquiredQuery(auth.authUserId))
}

export default useSearchReferenceListingEnquired