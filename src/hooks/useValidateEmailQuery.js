import { useAuth } from "@/components/Auth/Auth"
import { crmValidateEmail } from "@/services/bizchat"
import { useQuery } from "@tanstack/react-query"

const initialData = null

export default function useValidateEmailQuery (email, pid = null, enabled = true) {
  const auth = useAuth()

  const query = useQuery({
      queryKey: ['validateEmail', auth.authUserId, email, pid],
      queryFn: () => crmValidateEmail(auth.authUserId, email, pid),
      enabled: enabled,
      initialData
  })

  return query
}