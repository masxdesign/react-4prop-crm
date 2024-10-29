import { crmSharedTagPids, crmTagList } from '@/services/bizchat'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_dashboard/tags/')({
  component: () => <div>Hello /_auth/_dashboard/tags/!</div>
})

export function useTagListQueryOptions (authUserId) {
    return queryOptions({
        queryKey: ['tagList', authUserId],
        queryFn: () => crmTagList(authUserId)
    })
}

export function useSharedTagListQueryOptions (authUserId, import_id) {
    return queryOptions({
        queryKey: ['tagList', authUserId, import_id],
        queryFn: () => crmSharedTagPids(authUserId, import_id)
    })
}