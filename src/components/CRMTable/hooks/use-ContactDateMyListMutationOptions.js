import { useQueryClient } from "@tanstack/react-query"
import { util_add_each, util_pagin_update } from "@/utils/localStorageController"

const useContactDateMyListMutationOptions = ({ importId, tableDataQueryKey, mutationFn, onSuccess, authUserId }) => {
    const queryClient = useQueryClient()

    const mutationOptions = {
      mutationFn,
      onSuccess: (data, variables) => {
        if (tableDataQueryKey) {
          queryClient.setQueryData(tableDataQueryKey, util_pagin_update({ id: importId }, variables))
        }

        queryClient.setQueryData(['chatboxNoteList', authUserId, importId], util_add_each(data))

        onSuccess?.()
      }
    }

    return mutationOptions
}

export default useContactDateMyListMutationOptions