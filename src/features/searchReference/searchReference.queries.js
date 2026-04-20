import { fetchTagsByUserId, fetchTagsByUserIdEnquired } from "@/services/bizchat";
import { queryOptions } from "@tanstack/react-query";

// NEW: JWT-authenticated - user ID from token, not params
export const searchReferenceListingQuery = () => queryOptions({
    queryKey: ["searchReferenceListing"],
    queryFn: () => fetchTagsByUserId()
})

// NEW: JWT-authenticated - user ID from token, not params
export const searchReferenceListingEnquiredQuery = () => queryOptions({
    queryKey: ["searchReferenceListingEnquired"],
    queryFn: () => fetchTagsByUserIdEnquired()
})