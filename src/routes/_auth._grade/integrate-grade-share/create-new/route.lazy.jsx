import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UIFormFieldLabel from '@/components/UIFormFieldLabel/UIFormFieldLabel'
import { createLazyFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

export const Route = createLazyFileRoute('/_auth/_grade/integrate-grade-share/create-new')({
  component: AddClientComponent
})

function AddClientComponent () {
  const { defaultEmail } = useRouterState({
    select: state => state.location.state
  })

  const form = useForm({ 
    defaultValues: {
      first: '',
      last: '',
      company: '',
      email: defaultEmail,
      phone: '',
    }
  })

  return (
    <div className='flex flex-col gap-3 max-w-[400px]'>
      <label className='text-sm font-bold'>Email</label>
      {[
        ['email', 'Email*']
      ].map(([name, label]) => (
        <Input key={name} placeholder={label} {...form.register(name)} />
      ))}
      <label className='text-sm font-bold'>Full name</label>
      <div className='flex gap-3'>
        {[
          ['first', 'First*'],
          ['last', 'Last'],
        ].map(([name, label]) => (
          <Input key={name} placeholder={label} {...form.register(name)} />
        ))}
      </div>
      {[
        ['company', 'Company'],
        ['phone', 'Phone'],
      ].map(([name, label]) => (
        <Input key={name} placeholder={label} {...form.register(name)} />
      ))}
      <Button variant="outline" size="sm" asChild>
        <Link to="..">
          Change selection
        </Link>
      </Button>
      <Button type="submit" size="sm">
        Save & share
      </Button>
    </div>
  )
}