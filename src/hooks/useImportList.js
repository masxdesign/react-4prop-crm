import { crmImport } from "@/services/bizchat"
import { useMutation, useQueryClient } from "@tanstack/react-query"

// NEW: JWT-authenticated - crmImport no longer needs authUserId
export default function useImportList () {
    const queryClient = useQueryClient()

    const imports = useMutation({
      mutationFn: list => crmImport(list),
      onSuccess () {
        queryClient.invalidateQueries({ queryKey: ['list'] })
      }
    })

    return imports
  }