import { createFileRoute } from '@tanstack/react-router'
import useListing, { resolveAllPropertiesQuerySelector } from '@/store/use-listing'
import queryClient from '@/queryClient'

export const Route = createFileRoute('/_admin/_remote/integrate/send-enquiry')({
    loader: ({ context }) => queryClient.ensureQueryData(context.queryOptions),
    beforeLoad () {
        return {
            queryOptions: resolveAllPropertiesQuerySelector(useListing.getState())
        }
    }
})