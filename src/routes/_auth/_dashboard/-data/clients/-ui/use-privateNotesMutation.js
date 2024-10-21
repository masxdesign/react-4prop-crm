import { useAuthStore } from "@/store"
import { addLog, updateClient } from "@/api/api-fakeServer"
import { util_add, util_pagin_update } from "@/utils/localStorageController"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const usePrivateNotesMutation = ({ name, info, onSuccess }) => {
    const queryClient = useQueryClient()
  
    const uid = info.row.original.id
  
    const { dataQueryKey } = info.table.options.meta
  
    const user = useAuthStore.use.user()
    const author = user?.id
  
    const mutation = useMutation({
        mutationFn: (variables) => Promise.all([
          updateClient({ id: uid }, variables),
          addLog({ isJSON: true, message: JSON.stringify({ type: name, data: variables[name] }), uid, author })
        ]),
        onSuccess: ([_, log], variables) => {
          queryClient.setQueryData(dataQueryKey, util_pagin_update({ id: uid }, variables))
          queryClient.setQueryData(['log', uid], util_add(log))
          onSuccess?.()
        }
    })
  
    return mutation
}

export default usePrivateNotesMutation