import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useGradeShareContext } from '.'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Selection from '@/components/Selection'
import { useQuery } from '@tanstack/react-query'
import AssignTagInput from '@/features/tags/components/AssignTagInput'

export const Route = createFileRoute('/_auth/grade/_gradeWidget/$pid/share/confirm')({
  component: ConfirmComponent
})

function ConfirmComponent () {
  const { onShare, selected, tag, onTagChange, tagListQueryOptions } = useGradeShareContext()

  const list = useQuery(tagListQueryOptions)

  const { location } = useRouterState()

  return (
    <div className='space-y-3'>
      <div className='flex gap-3 items-center justify-between'>
          <h2 className='font-bold text-md space-x-3'>
              <span>Send this property to?</span>
          </h2>
          <Button variant="secondary" size="xs" asChild>
              <Link to=".." from={location.pathname}>
                  Change
              </Link>
          </Button>
      </div>
      <div className='space-y-1'>
        <Selection variant="active">
          {selected?.email}
        </Selection>
      </div>
      <div className='space-y-1'>
        <label className="text-sm font-bold">Assign a group tag to this property</label>
        {list.isFetching ? (
          <Loader2 className='animate-spin' />
        ) : (
          <AssignTagInput list={list.data} value={tag} onChange={onTagChange} />
        )}
      </div>
      <div className='flex justify-center'>
        <Button onClick={onShare} disabled={!tag}>Share</Button>
      </div>
    </div>
  )
}