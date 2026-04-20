import { createFileRoute } from '@tanstack/react-router'
import { List } from '@/routes/_auth._dashboard._layout-1/list_.$import_id.shared'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'
import PendingComponent from '@/components/PendingComponent'

export const Route = createFileRoute('/_auth/_dashboard/_layout-1/list_/$import_id/shared/')({
  component: ListSharedComponent,
  pendingComponent: PendingComponent,
})

// NEW: JWT-authenticated - List no longer needs auth.authUserId
export function ListSharedComponent () {
  return (
    <>
      <div className='flex flex-wrap gap-0 -mx-2'>
        <Suspense fallback={<Loader2 className='animate-spin' />}>
          <List />
        </Suspense>
      </div>
    </>
  )
}