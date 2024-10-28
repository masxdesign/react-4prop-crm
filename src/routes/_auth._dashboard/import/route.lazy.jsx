import 'react-csv-importer/dist/index.css'
import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Importer, ImporterField } from 'react-csv-importer';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import useImportList from '@/hooks/useImportList';
import ImportSingleContactForm from '@/components/ImportSingleContactForm';

export const Route = createLazyFileRoute('/_auth/_dashboard/import')({
  component: ImportComponent
})

function ImportComponent () {
  return (
    <Tabs defaultValue="single">
      <div className='flex justify-center'>
        <TabsList>
          <TabsTrigger value="single">Single</TabsTrigger>
          <TabsTrigger value="csv">Import a CSV</TabsTrigger>
        </TabsList>
      </div>
      <div className='flex justify-center p-4'>
        <TabsContent value="single" className="w-full max-w-[500px]">
          <SingleContactImport />
        </TabsContent>
        <TabsContent value="csv" className="w-full">
          <ImportCVSListScreen />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function SingleContactImport () {

  const [lastAdded, setLastAdded] = useState(null)
  

  const handleSubmit = (values) => {
    setLastAdded(values)
  }

  return (
    <div className='flex flex-col justify-center gap-5 py-5 mx-auto'>
      {lastAdded && (
        <div className='inline-flex justify-between items-center rounded-lg p-4 text-sm text-green-700 bg-green-100'>
          <span className='mr-10'>
            <b>{lastAdded.first}</b> was successfully added!
          </span>
          <Link 
            to='../list' 
            search={{ open: true, info: lastAdded.id }} 
            className='text-xs border border-green-700 hover:underline px-3 py-2 rounded-sm'
          >
            open 
          </Link>
        </div>
      )}
      <ImportSingleContactForm 
        onSubmit={handleSubmit} 
        submitText='Add contact'
      /> 
    </div>
  )
}

const initialResult = { saved: 0, skipped: 0 }

function ImportCVSListScreen () {

  const importList = useImportList()

  const navigate = useNavigate({ from: '/crm/dashboard/import' })

  const [result, setResult] = useState(initialResult)
  
  const { toast } = useToast()

  const handleData = async (list) => {
    try {

      const newResult = await importList.mutateAsync(list)

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