import { crmSharedTagPids, crmTagList } from "@/services/bizchat";

export const tagListQueryOptions = authUserId => ({
    queryKey: ['tagList', authUserId],
    queryFn: () => crmTagList(authUserId)
})

export function sharedTagListQueryOptions (from_uid, import_id) {
    return {
        queryKey: ['sharedTagList', from_uid, import_id],
        queryFn: () => crmSharedTagPids(from_uid, import_id)
    }
}