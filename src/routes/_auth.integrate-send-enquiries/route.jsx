import { createFileRoute } from '@tanstack/react-router'
import useListing, { resolveAllPropertiesQuerySelector } from '@/store/use-listing'
import queryClient from '@/queryClient'

export const Route = createFileRoute('/_auth/integrate-send-enquiries')({
    loader: ({ context }) => queryClient.ensureQueryData(context.queryOptions),
    beforeLoad () {
        return {
            queryOptions: {
                queryKey: ['newlyGradedWithDetails'],
                queryFn: useListing.getState().fetchNewlyGradedProperties
            }
        }
    }
})