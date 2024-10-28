import { useAuth } from '@/components/Auth/Auth-context'
import { crmSharedTagPids, crmTagList } from '@/services/bizchat'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_dashboard/tags/')({
  component: () => <div>Hello /_auth/_dashboard/tags/!</div>
})

export function useTagListQueryOptions () {
    const auth = useAuth()

    return queryOptions({
        queryKey: ['tagList', auth.authUserId],
        queryFn: () => crmTagList(auth.authUserId)
    })
}

export function useSharedTagListQueryOptions (import_id) {
    const auth = useAuth()

    return queryOptions({
        queryKey: ['tagList', auth.authUserId, import_id],
        queryFn: () => crmSharedTagPids(auth.authUserId, import_id)
    })
}