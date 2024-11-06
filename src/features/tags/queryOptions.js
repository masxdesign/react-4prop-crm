import { crmTagList } from "@/services/bizchat";

export const tagListQueryOptions = authUserId => ({
    queryKey: ['tagList', authUserId],
    queryFn: () => crmTagList(authUserId)
})