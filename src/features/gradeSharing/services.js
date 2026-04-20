import { crmFilterByEmail, crmRecentGradeShares } from "@/services/bizchat";

// NEW: JWT-authenticated - user ID from token, not params
export const filterByEmailQueryOptions = (email, pid, enabled) => ({
    queryKey: ['filterByEmail', email],
    queryFn: () => crmFilterByEmail(email, pid),
    enabled: enabled,
    initialData: []
})

// NEW: JWT-authenticated - user ID from token, not params
export const recentGradeSharesQueryOptions = () => ({
    queryKey: ['recentGradeShares'],
    queryFn: () => crmRecentGradeShares()
})