import { searchReferenceListingEnquiredQuery } from '@/features/searchReference/searchReference.queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/integrate-send-enquiries/rename-search-reference')({
  loader: ({ context: { queryClient, searchReferences } }) => {
    return queryClient.ensureQueryData(searchReferences)
  },
  beforeLoad: ({ context: { auth } }) => {
    return {
      searchReferences: searchReferenceListingEnquiredQuery(auth.authUserId)
    }
  }
})