import { createLazyFileRoute } from '@tanstack/react-router'
import { CheckCircle, CheckCircle2Icon, StarIcon } from 'lucide-react'

export const Route = createLazyFileRoute('/_auth/grade/share/success')({
  component: SuccessComponent
})

function SuccessComponent () {

  return (
    <div className='flex flex-col gap-4 items-center justify-center w-100 h-svh'>
      <div className='flex gap-3 items-center'>
        <CheckCircle className='w-32 h-32 text-green-500' />
        <div className='text-muted-foreground opacity-50'>
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
        </div>
      </div>
      <span className='font-bold'>Successfully shared</span>
    </div>
  )
}