import 'react-csv-importer/dist/index.css'
import { createLazyFileRoute, Link, useMatchRoute, useNavigate, useRouteContext, useRouter } from '@tanstack/react-router';
import { Importer, ImporterField } from 'react-csv-importer';
import * as yup from "yup"
import { useToast } from '@/components/ui/use-toast';
import { keepPreviousData, queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { crmFilterByEmail, crmImport } from '@/services/bizchat';
import { useForm, useWatch } from 'react-hook-form';
import UIFormFieldLabel from '@/components/UIFormFieldLabel/UIFormFieldLabel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRightIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/Auth/Auth-context';
import { useDebounce } from '@uidotdev/usehooks';
import { cx } from 'class-variance-authority';

export const Route = createLazyFileRoute('/_auth/_dashboard/import')({
  component: ImportComponent
})

function ImportComponent () {
  const { auth } = Route.useRouteContext()

  const { queryClient } = useRouteContext()
  const navigate = useNavigate({ from: '/crm/dashboard/import' })

  const importMutationOptions = {
    mutationFn: (list) => crmImport(list, auth.authUserId),
    onSuccess () {
      queryClient.invalidateQueries({ queryKey: ['list'] })
    }
  }

  const importMutation = useMutation(importMutationOptions)

  return (
    <div className='p-5'>
      <Tabs defaultValue="add" className='max-w-[800px] mx-auto'>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add">Add</TabsTrigger>
          <TabsTrigger value="manually">Manually</TabsTrigger>
          <TabsTrigger value="csv">Import a CSV</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <AddWizardMethodMainPage />
        </TabsContent>
        <TabsContent value="manually">
          <ManuallyMethod importMutation={importMutation} />
        </TabsContent>
        <TabsContent value="csv">
            <CSVMethod 
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

function ManuallyMethod ({ importMutation }) {
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
        <h2 className='text-lg font-bold'>Add new contact</h2>
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
        <div className='h-8' />
        <Button type="submit" className="mx-auto block">
          Add
        </Button>
        {lastEntry && (
          <p className='text-center mt-5 text-sm text-muted-foreground'>
            Contact successfully added!<br/>
            <Link to='/crm/dashboard/list' search={{ open: true, info: `${lastEntry.id}` }} className='hover:underline'>
              <span>View <b>{lastEntry.first}</b></span><ArrowRightIcon className='ml-2 w-3 h-3 inline' /> 
            </Link>
          </p>
          )}
      </form>
    </Form>
  )
}

const initialResult = { saved: 0, skipped: 0 }

function CSVMethod ({ navigate, importMutation }) {
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

// const emails = faker.helpers.multiple(() => faker.internet.email(), {
//   count: 5,
// })
// console.log(emails);
const emails = [
  "Alexane39@yahoo.com",
  "Tillman55@hotmail.com",
  "Rebeca74@gmail.com",
  "Mckenzie.Moen59@yahoo.com",
  "Angel_Strosin98@gmail.com",
  "Angel_uttma@gmail.com",
]

const initialFiltered = []

const AddWizardMethodStep1 = ({ onSelect }) => {
  const auth = useAuth()
  
  const [value, setValue] = useState("")
  
  const valueDebounced = useDebounce(value, 600)

  const queryEnabled = valueDebounced.length > 2

  const query = useQuery(queryOptions({
    queryKey: ['filterByEmail', auth.authUserId, valueDebounced],
    queryFn: () => crmFilterByEmail(auth.authUserId, valueDebounced),
    enabled: queryEnabled,
    initialData: initialFiltered
  }))

  const handleValue = (e) => {
    setValue(e.target.value)
  }

  const handleAdd = () => {
    onSelect(valueDebounced)
  }

  return (
    <>
      <h3 className='text-md mb-3 font-bold'>Select client</h3>
      <div className='flex flex-col gap-3'>
        <div className='flex gap-3'>
          <Input value={value} onChange={handleValue} />
          {queryEnabled && query.data.length < 1 && (
            <Button  
              variant="default" 
              disabled={!valueDebounced.includes('@')} 
              className={cx({ "opacity-50": !valueDebounced.includes('@') })}
              onClick={handleAdd}
            >
              Add
            </Button>
          )}
        </div>
        {query.isFetching && <Loader2 className='animate-spin' />}
        {query.data.map(item => (
          <Button 
            key={item.id} 
            variant="outline"
            onClick={() => onSelect(null, item)}
          >
            {item.email}
          </Button>
        ))}
      </div>
    </>
  )
}

const AddWizardMethodMainPage = () => {
  const [value, setValue] = useState(1)
  const [currState, setCurrState] = useState(null)
  
  const handleSelect = (newItem, selectedItem) => {

    if (newItem) {
      setValue(2)
      setCurrState(newItem)
      return
    }
    
    if (selectedItem) {
      setValue(3)
      setCurrState(selectedItem)
    }

  }

  const handleReset = () => {
    setValue(1)
    setCurrState(null)
  }

  return (
    <Tabs onValueChange={setValue} value={value} >
      <TabsContent value={1}>
        <AddWizardMethodStep1 onSelect={handleSelect} />
      </TabsContent>
      <TabsContent value={2}>
        <p>{currState}</p>
        <Button onClick={handleReset}>Back</Button>
      </TabsContent>
      <TabsContent value={3}>
        <p>{JSON.stringify(currState)}</p>
        <Button onClick={handleReset}>Back</Button>
      </TabsContent>
    </Tabs>
  )
}