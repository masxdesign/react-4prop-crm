import { fetchTagsByUserId, fetchTagsByUserIdEnquired } from "@/services/bizchat";
import { queryOptions } from "@tanstack/react-query";

export const searchReferenceListingQuery = (authUserId) => queryOptions({
    queryKey: ["searchReferenceListing", authUserId],
    queryFn: () => fetchTagsByUserId(authUserId)
})

export const searchReferenceListingEnquiredQuery = (authUserId) => queryOptions({
    queryKey: ["searchReferenceListingEnquired", authUserId],
    queryFn: () => fetchTagsByUserIdEnquired(authUserId)
})