import { useAuth } from "@/components/Auth/Auth-context"
import { crmValidateEmail } from "@/services/bizchat"
import { queryOptions, useQuery } from "@tanstack/react-query"

const initialValidateEmaiFiltered = []

export default function useValidateEmailQuery (email, pid = null, enabled = true) {
  const auth = useAuth()

  const query = useQuery(queryOptions({
      queryKey: ['validateEmail', auth.authUserId, email, pid],
      queryFn: () => crmValidateEmail(auth.authUserId, email, pid),
      enabled: enabled && !!email,
      initialData: initialValidateEmaiFiltered
  }))

  return query
}