import 'react-csv-importer/dist/index.css'
import { createLazyFileRoute, Link, useNavigate, useRouteContext, useRouter } from '@tanstack/react-router';
import { Importer, ImporterField } from 'react-csv-importer';
import * as yup from "yup"
import { useToast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { crmImport } from '@/api/bizchat';
import { useForm } from 'react-hook-form';
import UIFormFieldLabel from '@/components/UIFormFieldLabel/UIFormFieldLabel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import delay from '@/utils/delay';
import { useState } from 'react';
import { ArrowRightIcon } from 'lucide-react';

export const Route = createLazyFileRoute('/_admin/_dashboard/dashboard/import')({
  component: ImportComponent
})

function ImportComponent () {
  const { auth } = Route.useRouteContext()

  const { queryClient } = useRouteContext()
  const navigate = useNavigate({ from: '/crm/dashboard/import' })
  
  const authUserId = `U${auth.user.id}`

  const importMutationOptions = {
    mutationFn: (list) => crmImport(list, authUserId),
    onSuccess () {
      queryClient.invalidateQueries({ queryKey: ['list'] })
    }
  }

  const importMutation = useMutation(importMutationOptions)

  return (
    <div className='p-5'>
      <Tabs defaultValue="single" className='max-w-[800px] mx-auto'>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="bulk">Import a CSV</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <AddSingleForm 
            navigate={navigate} 
            importMutation={importMutation}
          />
        </TabsContent>
        <TabsContent value="bulk">
            <ImportPane 
              navigate={navigate} 
              importMutation={importMutation}
            />
        </TabsContent>
      </Tabs>
    </div>
  )
}

const schema = yup.object({
  first: yup.string().required(),
  email: yup.string().required(),
})

function AddSingleForm ({ navigate, importMutation }) {
  const [lastEntry, setLastEntry] = useState(null)
  
  const { toast } = useToast()

  const form = useForm({ 
    resolver: yupResolver(schema),
    defaultValues: {
      first: '',
      last: '',
      company: '',
      email: '',
      phone: '',
    }
  })

  const onSubmit = async (values) => {
    try {
      const { saved } = await importMutation.mutateAsync([values])

      form.reset()

      setLastEntry({
        ...values,
        id: saved[0]
      })
      
      toast({
        description: 'Successfully added'
      })

    } catch (e) {

      toast({
        description: e.message
      })
    
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[400px] mx-auto">
        <div className='h-10' />
        <h2 className='text-lg font-bold text-center'>Add a Single Client</h2>
        <div className='h-5' />
        <div className='flex gap-3'>
          {[
            ['first', 'First*'],
            ['last', 'Last'],
          ].map(([name, label]) => (
            <UIFormFieldLabel 
              key={name}
              form={form} 
              name={name} 
              label={label}
              placeholder={label}
              className="basis-1/2"
            />
          ))}
        </div>
        {[
          ['email', 'Email*'],
          ['company', 'Company'],
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
          Save
        </Button>
        {lastEntry && (
            <Link to='/crm/dashboard/list' search={{ open: true, info: `${lastEntry.id}` }} className='flex items-center'>
              <span>View <u>{lastEntry.first}</u></span><ArrowRightIcon className='ml-2 w-3 h-3' /> 
            </Link>
          )}
      </form>
    </Form>
  )
}

const initialResult = { saved: 0, skipped: 0 }

function ImportPane ({ navigate, importMutation }) {
  const [result, setResult] = useState(initialResult)
  
  const { toast } = useToast()

  const handleData = async (list) => {
    try {

      const newResult = await importMutation.mutateAsync(list)

      setResult(value => ({ 
        saved: value.saved + newResult.saved, 
        skipped: value.skipped + newResult.skipped 
      }))
      
    } catch (e) {
     
      setResult(value => ({ 
        ...value,
        skipped: value.skipped + list.length
      }))
    }
  }

  const handleClose = () => {
    navigate({ to: '/crm/dashboard/list' })
  }
  
  const handleComplete = () => {
    toast({
      description: `${result.saved} successfully imported!` + (result.skipped > 0 ? ` ${result.skipped} emails already exists`: '')
    })

    setResult(initialResult)
  }

  return (
    <Importer
      dataHandler={handleData}
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
  )
}