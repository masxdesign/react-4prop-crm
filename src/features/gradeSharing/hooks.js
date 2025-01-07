import { useAuth } from "@/components/Auth/Auth";
import { crmShareGrade } from "@/services/bizchat";
import { useMutation } from "@tanstack/react-query";

export function usePidGradesMutation () {
    const auth = useAuth()
    
    const mutation = useMutation({
        mutationFn: ({ recipient_import_id, tag_id, pidGrades }) => crmShareGrade(
            auth.authUserId, 
            recipient_import_id,
            tag_id,
            pidGrades
        )
    })

    return mutation
}