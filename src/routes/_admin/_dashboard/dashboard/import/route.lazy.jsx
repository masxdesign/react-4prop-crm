import 'react-csv-importer/dist/index.css'
import { createLazyFileRoute, useNavigate, useRouteContext, useRouter } from '@tanstack/react-router';
import { Importer, ImporterField } from 'react-csv-importer';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { crmImport } from '@/api/bizchat';

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/import')({
  component: ImportComponent
})

function ImportComponent () {
  const { queryClient } = useRouteContext()
  const { auth } = Route.useRouteContext()

  const { toast } = useToast()

  const navigate = useNavigate({ from: '/crm/dashboard/import' })

  const mutation = useMutation({
    mutationFn: crmImport
  })

  const dataHandler = (list) => {
    mutation.mutate({ list, ownerUid: `U${auth.user.id}` })
    queryClient.invalidateQueries({ queryKey: ['list'] })
  }
  
  const handleClose = () => {
    navigate({ to: '/crm/dashboard/list' })
  }
  
  const handleComplete = () => {
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
        {[
          ['first', false],
          ['last', false],
          ['email', false],
          ['phone'],
          ['company'],
        ].map(([name, optional = true]) => (
          <ImporterField 
            key={name} 
            name={name} 
            label={name} 
            optional={optional} 
          />
        ))}
      </Importer>
    </>
  )
}