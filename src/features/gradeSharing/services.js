import { crmFilterByEmail, crmRecentGradeShares } from "@/services/bizchat";

export const filterByEmailQueryOptions = (authUserId, email, pid, enabled) => ({
    queryKey: ['filterByEmail', authUserId, email],
    queryFn: () => crmFilterByEmail(authUserId, email, pid),
    enabled: enabled,
    initialData: []
})

export const recentGradeSharesQueryOptions = (from_uid) => ({
    queryKey: ['recentGradeShares', from_uid],
    queryFn: () => crmRecentGradeShares(from_uid)
})