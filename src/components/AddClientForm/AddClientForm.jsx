import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as yup from "yup"
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { addClient } from '@/api/api-fourprop'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import '@/App.css'

const schema = yup.object({
  name: yup.string().required()
})

const AddClientForm = () => {
  
  const queryClient = useQueryClient()

  const form = useForm({ 
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
    }
  })

  const mutation = useMutation({
    mutationFn: addClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    }
  })

  const onSubmit = (data) => mutation.mutate(data)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

export default AddClientForm