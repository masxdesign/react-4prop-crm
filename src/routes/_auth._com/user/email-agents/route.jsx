import { createFileRoute } from '@tanstack/react-router'
import useListing from '@/store/use-listing'

export const Route = createFileRoute('/_auth/_com/user/email-agents')({
    loader: ({ context: { newlyGradedWithDetails, queryClient } }) => 
        queryClient.ensureQueryData(newlyGradedWithDetails),
    beforeLoad () {
        return {
            newlyGradedWithDetails: {
                queryKey: ['newlyGradedWithDetails'],
                queryFn: useListing.getState().fetchNewlyGradedProperties
            }
        }
    }
})