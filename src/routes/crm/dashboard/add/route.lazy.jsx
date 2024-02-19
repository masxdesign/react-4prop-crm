import { addClient } from '@/api/api-fakeServer';
import Clientform from '@/components/Clientform';
import { Separator } from '@/components/ui/separator';
import { useListStore } from '@/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

  const mutation = useMutation({
      mutationFn: addClient
  })

  const handleSubmit = async (data) => {
      await mutation.mutateAsync(data)
      router.invalidate()
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      sortByCreatedDesc()
      navigate({ to: '/crm/dashboard/' })
  }

  return (
    <Clientform defaultValues={defaultValues} onSubmit={handleSubmit} className="space-y-8">
      <h3 className="mb-4 text-lg font-medium">Personal</h3>
      <Clientform.PersonalDetails />  
      <Separator className="my-4" />
      <h3 className="mb-4 text-lg font-medium">Contact</h3>
      <Clientform.ContactDetails />    
      <Separator className="my-4" />
      <h3 className="mb-4 text-lg font-medium">Address</h3>
      <Clientform.Address />      
      <Separator className="my-4" />
      <h3 className="mb-4 text-lg font-medium">Categories</h3>
      <Clientform.Categories />  
      <Separator className="my-4" />
      <Clientform.Submit>
          Save
      </Clientform.Submit> 
    </Clientform>
  )
}