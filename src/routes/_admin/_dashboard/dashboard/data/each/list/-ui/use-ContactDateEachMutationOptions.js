import { util_add_each, util_pagin_update } from "@/utils/localStorageController"
import { useQueryClient } from "@tanstack/react-query"

const useContactDateEachMutationOptions = ({ id, tableDataQueryKey, mutationFn, onSuccess }) => {
    const queryClient = useQueryClient()

    const mutationOptions = {
      mutationFn: (variables) => mutationFn(variables, { id }),
      onSuccess: (data, variables) => {
        if (tableDataQueryKey) {
          queryClient.setQueryData(tableDataQueryKey, util_pagin_update({ id }, variables))
        }
        queryClient.setQueryData(['chatboxEach', id], util_add_each(data[0]))
        onSuccess?.()
      }
    }

    return mutationOptions
}

export default useContactDateEachMutationOptions