import { crmShareGrade } from "@/services/bizchat";
import { useMutation } from "@tanstack/react-query";

// NEW: JWT-authenticated - crmShareGrade no longer needs authUserId
export function usePidGradesMutation () {
    const mutation = useMutation({
        mutationFn: ({ recipient_import_id, tag_id, pidGrades }) => crmShareGrade(
            recipient_import_id,
            tag_id,
            pidGrades
        )
    })

    return mutation
}