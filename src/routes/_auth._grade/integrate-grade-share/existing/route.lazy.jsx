import { Button } from '@/components/ui/button'
import { createLazyFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { CheckIcon, Loader2 } from 'lucide-react'

export const Route = createLazyFileRoute('/_auth/_grade/integrate-grade-share/existing')({
  component: GradeComponent
})

function GradeComponent () {

  const { selected } = useRouterState({
    select: state => state.location.state
  })

  if (!selected) return <Loader2 className='animate-spin' />

  return (
    <div className='flex flex-col gap-2 max-w-[400px]'>
      <div className='flex items-center gap-2 text-center py-4 px-4 rounded-md text-sm text-green-800 border border-green-800'>
        <CheckIcon className='h-4 w-4' />
        <div className='grow relative h-5'>
          <div className='absolute left-0 right-0 top-0 bottom-0 text-left truncate'>
            {selected.email}
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="..">
          Change selection
        </Link>
      </Button>
      <Button size="sm" asChild>
        <Link to="..">
          Share
        </Link>
      </Button>
    </div>
  )
}