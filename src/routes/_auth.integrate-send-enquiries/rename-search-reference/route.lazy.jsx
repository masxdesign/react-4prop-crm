import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import { produce } from 'immer'
import _, { keyBy } from 'lodash'
import { LoaderIcon, PencilLine } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from "yup"
import { Input } from '@/components/ui/input'
import { yupResolver } from '@hookform/resolvers/yup'
import delay from '@/utils/delay'
import { Slot } from '@radix-ui/react-slot'
import { ErrorMessage } from '@hookform/error-message'
import '@/utils/yup-unique'
import { crmUpdateTag } from '@/services/bizchat'
import { useAuth } from '@/components/Auth/Auth-context'
import useListing, { allPropertySearchReferenceRenamed } from '@/store/use-listing'

const validateSchema = yup.object().shape({
  data: yup.array().of(
    yup.object().shape({
      name: yup.string().label("Name").required()
    })
  )
  .unique("Name must be unique", (a) => a.name)
})

export const Route = createLazyFileRoute('/_auth/integrate-send-enquiries/rename-search-reference')({
  component: RouteComponent
})

function RouteComponent() {
  const { searchReferences, queryClient, auth } = Route.useRouteContext()

  const [filter, setFilter] = useState("")
  const [current, setCurrent] = useState(null)
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const { data } = useSuspenseQuery({
    ...searchReferences,
    select: (tags) => tags.filter(row => {
      return row.name.trim().toLowerCase().includes(filter.trim().toLowerCase())
    })
  })

  const form = useForm({
    defaultValues: { data },
    resolver: yupResolver(validateSchema)
  })

  const updateTag = useMutation({
    mutationFn: (variables) => crmUpdateTag(auth.authUserId, variables.tag_id, variables.newName)
  })

  const listingDispatch = useListing.use.dispatch()

  const handleValid = async (index, values) => {
    setCurrent(index)
    const newName = values.data[index].name

    if (_.isEqual(newName, data[index].name)) return

    await updateTag.mutateAsync({
      tag_id: data[index].id,
      newName
    })

    await delay(500)

    console.log("saved!");
    
    listingDispatch(allPropertySearchReferenceRenamed(data[index].id, newName))

    queryClient.setQueryData(searchReferences.queryKey, (prev) => produce(prev, draft => {
      draft[index].name = newName
    }))

    setCurrent(null)

  }

  const handleInvalid = (index, errors) => {
    setCurrent(index)
    form.setValue(`data.${index}.name`, data[index].name, { shouldValidate: true })
    console.log(errors);
    
  }

  const list = data.length > 0 ? (
    data.map((row, index) => (
      <div key={row.id}>
        <div className='group relative'>
          <Input 
            {...form.register(`data.${index}.name`, {
              onBlur: form.handleSubmit(
                (values) => handleValid(index, values), 
                (errors, e) => handleInvalid(index, errors, e)
              )
            })}
            disabled={form.formState.isSubmitting}
            placeholder={row.name}
            className="text-sm block px-3 py-2 h-auto shadow-sm group-hover:shadow-md border-sky-300 text-sky-500" 
          />
          <Slot className='absolute right-3 top-2 size-4 text-sky-500'>
            {current === index && form.formState.isSubmitting ? (
              <LoaderIcon className='animate-spin' />
            ) : (
              <PencilLine className='text-muted-foreground group-hover:block group-focus-within:block hidden' />
            )}
          </Slot>
        </div>
        {current === index && (
          <ErrorMessage 
            errors={form.formState.errors} 
            name={`data.root`}
            render={({ message }) => <p className='text-xs p-2 bg-red-50 text-red-500'>{message}</p>}
          />
        )}
        <ErrorMessage 
          errors={form.formState.errors} 
          name={`data.${index}.name`}
          render={({ message }) => <p className='text-xs p-2 bg-red-50 text-red-500'>{message}</p>}
        />
      </div>
    ))
  ) : (
    <div className='min-h-64 flex items-center justify-center'>
      <h2 className='text-2xl text-muted-foreground'>No result, try a different keyword</h2>
    </div>
  )

  return (
    <main className='space-y-4 py-8'>
      <h1 className='text-3xl font-bold'>Rename search references</h1>
      <Input type="search" placeholder="Filter search reference..." value={filter} onChange={handleFilterChange} className=" block px-3 py-2 h-auto text-sm max-w-[280px]" />
      <section className='space-y-2'>
        {list}
      </section>
    </main>
  )
}