import { fetchEnquiredPropertyByPidQuery, subtypesQuery, typesQuery } from '@/store/listing.queries'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/view-details/$pid')({
    loader: ({ context: { queryClient, listQuery } }) => {
        return Promise.all([
            queryClient.ensureQueryData(typesQuery),
            queryClient.ensureQueryData(subtypesQuery),
            queryClient.ensureQueryData(listQuery),
        ])
    },
    beforeLoad: ({ params, search }) => {
        return {
            listQuery: fetchEnquiredPropertyByPidQuery(params.pid, search.i)
        }
    }
})