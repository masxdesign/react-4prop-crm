import ClientFormInsert from '@/components/Clientform/ClientFormInsert';
import { useListStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';
import { createLazyFileRoute, useNavigate, useRouter } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/dashboard/add')({
  component: AddComponent,
})



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