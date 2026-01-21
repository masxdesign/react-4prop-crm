import { crmValidateEmail } from "@/services/bizchat"
import { useQuery } from "@tanstack/react-query"

const initialData = null

// NEW: JWT-authenticated - crmValidateEmail no longer needs authUserId
export default function useValidateEmailQuery (email, pid = null, enabled = true) {
  const query = useQuery({
      queryKey: ['validateEmail', email, pid],
      queryFn: () => crmValidateEmail(email, pid),
      enabled: enabled,
      initialData
  })

  return query
}