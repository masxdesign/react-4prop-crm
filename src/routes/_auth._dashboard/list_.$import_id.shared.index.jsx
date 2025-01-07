import { createFileRoute } from '@tanstack/react-router'
import { List } from '@/routes//_auth._dashboard/list_.$import_id.shared'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import { useAuth } from '@/components/Auth/Auth'
import PendingComponent from '@/components/PendingComponent'

export const Route = createFileRoute('/_auth/_dashboard/list/$import_id/shared/')({
  component: ListSharedComponent,
  pendingComponent: PendingComponent,
})

export function ListSharedComponent () {
  const auth = useAuth()

  return (
    <>
      <div className='flex flex-wrap gap-0 -mx-2'>
        <Suspense fallback={<Loader2 className='animate-spin' />}>
          <List from={auth.authUserId} />
        </Suspense>
      </div>
    </>
  )

}