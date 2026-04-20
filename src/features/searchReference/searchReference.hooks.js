import { searchReferenceListingEnquiredQuery } from "./searchReference.queries"
import { useSuspenseQuery } from "@tanstack/react-query"

// NEW: JWT-authenticated - no need for auth.authUserId
const useSearchReferenceListingEnquired = () => {
    return useSuspenseQuery(searchReferenceListingEnquiredQuery())
}

export default useSearchReferenceListingEnquired