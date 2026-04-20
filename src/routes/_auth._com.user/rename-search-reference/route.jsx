import { searchReferenceListingEnquiredQuery } from '@/features/searchReference/searchReference.queries'
import { createFileRoute } from '@tanstack/react-router'

// NEW: JWT-authenticated - searchReferenceListingEnquiredQuery no longer needs authUserId
export const Route = createFileRoute('/_auth/_com/user/rename-search-reference')({
  loader: ({ context: { queryClient, searchReferences } }) => {
    return queryClient.ensureQueryData(searchReferences)
  },
  beforeLoad: () => {
    return {
      searchReferences: searchReferenceListingEnquiredQuery()
    }
  }
})