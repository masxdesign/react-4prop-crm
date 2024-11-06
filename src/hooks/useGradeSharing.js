import { useAuth } from "@/components/Auth/Auth-context"
import { useTagListQueryOptions } from "@/routes/_auth._dashboard/tags"
import { decodeFromBinary } from "@/utils/binary"
import { createImmer } from "@/utils/zustand-extras"
import { useQueryClient } from "@tanstack/react-query"

export const useGradeSharingStore = createImmer((set, get) => ({
    tag: null,
    openedPid: null,
    openedGrade: null,
    selected: null,
    grades: [],
    setFromBin: bin => {

        const [selectedId, selectedEmail, tagId, tagName] = JSON.parse(decodeFromBinary(bin))

        set(state => {
            state.tag = {
                id: tagId,
                name: tagName
            }
            state.selected = {
                id: selectedId,
                email: selectedEmail
            }
        })

    },
    setOpenedProperty: (grade, pid) => set({ openedPid: pid, openedGrade: grade }),
    setTag: tag => set({ tag }),
    setOpenedGrade: openedGrade => set({ openedGrade }),
    setSelected: selected => set({ selected }),
    removePidGrade: pid => {

        const index = get().grades.findIndex(item => item.pid === pid)

        if (index < 0) return
            
        set(state => {
            state.grades.splice(index, 1)
        })

    },
    upsertPidGrade: (pid, grade) => {

        const index = get().grades.findIndex(item => item.pid === pid)

        if(index < 0) {
            set(state => {
                state.grades.push({ grade, pid })
            })
            return
        }
        set(state => {
            state.grades[index].grade = grade
        })

    }
}))

function useGradeSharingSubmitSelected (selected, tag, grades = []) {

    const queryClient = useQueryClient()
    const tagListQueryOptions = useTagListQueryOptions(auth.authUserId)

    const addTag = useMutation({
        mutationFn: name => crmAddTag(auth.authUserId, name)
    })

    const shareGrade = useMutation({
        mutationFn: ({ recipient_import_id, pid, grade, tag_id }) => crmShareGrade(
            auth.authUserId, 
            recipient_import_id, 
            pid, 
            grade, 
            tag_id
        )
    })

    const handleShare = async () => {

        let tag_id = tag.id

        if (tag_id < 0) {
            const newTag = await addTag.mutateAsync(tag.name)
            tag_id = newTag.id

            queryClient.invalidateQueries({ queryKey: tagListQueryOptions.queryKey })
        }

        for(const { grade, pid } of grades) {

            const result = await shareGrade.mutateAsync({
                recipient_import_id: selected.id, 
                pid, 
                grade, 
                tag_id 
            })
    
            console.log(result)

        }

        navigate({ to: AuthGradeShareSuccessRouteImport.to })

    }

}

export default function useGradeSharing (pid) {
    const auth = useAuth()

    const navigate = useNavigate()

    const [selected, setSelected] = useState(null)
    const [tag, setTag] = useState(null)

    const handleConfirm = newSelected => {
        setSelected(newSelected)
        navigate({ to: AuthGradePidShareConfirmImport.to })
    }


}