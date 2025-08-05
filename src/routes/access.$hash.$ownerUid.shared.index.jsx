import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { List } from '@/routes/_auth._dashboard._layout-1/list_.$import_id.shared'
import PendingComponent from '@/components/PendingComponent'

export const Route = createFileRoute('/access/$hash/$ownerUid/shared/')({
  component: AccessSharedIndexComponent,
  pendingComponent: PendingComponent,
})

export function AccessSharedIndexComponent () {
  const { ownerUid } = Route.useParams()

  return (
    <div className='flex flex-wrap gap-0 -mx-2'>
      <Suspense fallback={<Loader2 className='animate-spin' />}>
        <List from={ownerUid} />
      </Suspense>
    </div>
  )
}