import 'react-csv-importer/dist/index.css'
import { createLazyFileRoute, useNavigate, useRouteContext, useRouter } from '@tanstack/react-router';
import { Importer, ImporterField } from 'react-csv-importer';
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { crmImport } from '@/api/bizchat';
import { useForm } from 'react-hook-form';
import UIFormFieldLabel from '@/components/UIFormFieldLabel/UIFormFieldLabel';
import Form from '@/components/Form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const form = useForm({ 
    defaultValues: {
      first: ''
    }
  })

  const onSubmit = () => {

  }

  return (
    <div className='p-5'>
      <Tabs defaultValue="bulk" className='max-w-[800px] mx-auto'>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="bulk">Bulk</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[500px] mx-auto">
              <div className='h-10' />
              <h2 className='text-lg font-bold text-center'>New client</h2>
              {[
                ['company', 'Company'],
                ['first', 'First'],
                ['last', 'Last'],
                ['email', 'Email'],
                ['phone', 'Phone'],
              ].map(([name, label]) => (
                <UIFormFieldLabel 
                  key={name}
                  form={form} 
                  name={name} 
                  label={label}
                  placeholder={label}
                />
              ))}
              <div className='h-4' />
              <Button type="submit" className="mx-auto block">
                Add client
              </Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="bulk">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}