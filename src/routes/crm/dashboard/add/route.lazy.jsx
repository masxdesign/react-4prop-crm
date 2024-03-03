import ClientFormInsert from '@/components/Clientform/ClientFormInsert';
import { useListStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate, useRouter } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/crm/dashboard/add')({
  component: AddComponent,
})

const defaultValues = {
  company: '',
  phone: '',
  email: '',
  title: '',
  first: '',
  last: '',
  city: '',
  postcode: '',
  website: '',
  categories: []
}

function AddComponent() {

  const sortByCreatedDesc = useListStore.use.sortByCreatedDesc()

  const navigate = useNavigate({ from: '/crm/dashboard/add' })

  const queryClient = useQueryClient()

  const router = useRouter()

  const handleSubmit = async () => {
      router.invalidate()
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      sortByCreatedDesc()
      navigate({ to: '/crm/dashboard/' })
  }

  return (
    <ClientFormInsert defaultValues={defaultValues} onSubmit={handleSubmit} />
  )
}