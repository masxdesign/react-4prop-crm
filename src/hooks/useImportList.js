import { useAuth } from "@/components/Auth/Auth-context"
import { crmImport } from "@/services/bizchat"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useImportList () {
    const queryClient = useQueryClient()
    const auth = useAuth()

    const imports = useMutation({
      mutationFn: list => crmImport(list, auth.authUserId),
      onSuccess () {
        queryClient.invalidateQueries({ queryKey: ['list'] })
      }
    })
  
    return imports
  }