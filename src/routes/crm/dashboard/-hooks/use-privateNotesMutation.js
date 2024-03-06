import { useAuthStore } from "@/store"
import { util_add, util_pagin_update } from "@/utils/localStorageController"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const usePrivateNotesMutation = (info, curr_field, onSuccess) => {
    const queryClient = useQueryClient()
  
    const uid = info.row.original.id
  
    const { currentQueryOptions } = info.table.options.meta
  
    const user = useAuthStore.use.user()
    const author = user?.id
  
    const mutation = useMutation({
        mutationFn: (data) => Promise.all([
          updateClient({ id: uid }, data),
          addLog({ isJSON: true, message: JSON.stringify({ type: curr_field, data: data[curr_field] }), uid, author })
        ]),
        onSuccess: ([_, log], variables) => {
          queryClient.setQueryData(currentQueryOptions.queryKey, util_pagin_update({ id: uid }, variables))
          queryClient.setQueryData(['log', uid], util_add(log))
          onSuccess && onSuccess()
        }
    })
  
    return mutation
}

export default usePrivateNotesMutation