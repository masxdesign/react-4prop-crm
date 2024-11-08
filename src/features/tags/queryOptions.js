import { crmSharedTagPids, crmTagList } from "@/services/bizchat";

export const tagListQueryOptions = authUserId => ({
    queryKey: ['tagList', authUserId],
    queryFn: () => crmTagList(authUserId)
})

export function sharedTagListQueryOptions (authUserId, import_id) {
    return {
        queryKey: ['sharedTagList', authUserId, import_id],
        queryFn: () => crmSharedTagPids(authUserId, import_id)
    }
}