import { updateGrade } from "@/services/fourProp"
import { useMutation } from "@tanstack/react-query"

export const useGradeUpdater = (pid) => {
    return useMutation({
        mutationFn: (values) => {
            let variables = {}

            if ("tag" in values) {
                const { tag } = values

                if (tag.id === -1) {
                    variables.autoSearchReference = tag.name
                } else {
                    variables.tag_id = tag.id
                }
            }

            if ("grade" in values) {
                const { grade } = values
                variables.grade = grade
            }
    
            return updateGrade(pid, variables)
        }
    })

}