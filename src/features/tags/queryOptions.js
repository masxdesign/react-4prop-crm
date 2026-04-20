import { crmSharedTagPids, crmTagList } from "@/services/bizchat";

// NEW: JWT-authenticated - user ID from token, not params
export const tagListQueryOptions = () => ({
    queryKey: ['tagList'],
    queryFn: () => crmTagList()
})

// NEW: JWT-authenticated - user ID from token, not params
export function sharedTagListQueryOptions () {
    return {
        queryKey: ['sharedTagList'],
        queryFn: () => crmSharedTagPids()
    }
}