import 'react-csv-importer/dist/index.css'
import { createLazyFileRoute, createRouter, useNavigate, useRouteContext, useRouter } from '@tanstack/react-router';
import { Importer, ImporterField } from 'react-csv-importer';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CSV_FIELDS } from '@/api/data/fake-clients';
import { bulkInsertClient } from '@/api/api-fakeServer';
import { useListStore } from '@/store';

export const Route = createLazyFileRoute('/crm/dashboard/import')({
  component: AddComponent,
})

function AddComponent() {
  const { queryClient } = useRouteContext()

  const router = useRouter()

  const sortByCreatedDesc = useListStore.use.sortByCreatedDesc()

  const { toast } = useToast()
  const navigate = useNavigate({ from: '/crm/dashboard/import' })

  const mutation = useMutation({
    mutationFn: bulkInsertClient
  })

  const dataHandler = (rows, { startIndex }) => {
    mutation.mutate(rows)
    router.invalidate()
    queryClient.invalidateQueries({ queryKey: ['clients'] })
  }
  
  const handleClose = () => {
    navigate({ to: '/crm/dashboard/' })
  }
  
  const handleComplete = () => {
    sortByCreatedDesc()
    toast({
      description: 'Successfully imported'
    })
  }

  return (
    <>
      <Importer
        dataHandler={dataHandler}
        onComplete={handleComplete}
        onClose={handleClose} 
        defaultNoHeader={false} 
        restartable 
      >
        {CSV_FIELDS.map(([name, optional]) => (
          <ImporterField key={name} name={name} label={name} optional={optional} />
        ))}
      </Importer>
    </>
  )
}