import { createFileRoute, Outlet, useLoaderData } from '@tanstack/react-router'
import { SharedListPage } from '@/routes/_auth._dashboard/list_.$import_id.shared'
import PendingComponent from '@/components/PendingComponent'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Loader2, User } from 'lucide-react'
import { FOURPROP_BASEURL } from '@/services/fourProp'

export const Route = createFileRoute('/access/$hash/$ownerUid/shared')({
  component: AccessSharedWrapperComponent,
  pendingComponent: PendingComponent,
  beforeLoad () {
    return {
        parentRouteFullPath: Route.fullPath,
    }
  }
})

export function AccessSharedWrapperComponent () {
    const { ownerUid } = Route.useParams()

    return (
        <div className='p-3'>
            <SharedListPage 
                from={ownerUid}
                list={<Outlet />}
                sidebarBlock={
                    <Suspense fallback={<Loader2 className='animate-spin' />}>
                        <Owner />
                    </Suspense>
                }
            />
        </div>
    )
}

function Owner () {
    const { ownerQueryOptions } = Route.useRouteContext()
    const { data } = useSuspenseQuery(ownerQueryOptions)

    return (
        <div className='space-y-5'>
            <h2 className='flex gap-3 font-bold text-lg'>
                <User />
                <span>Agent</span>
            </h2>
            <div className='flex gap-4'>
                <img src={`${FOURPROP_BASEURL}${data.avatar}`} className='grayscale brightness-125 rounded-full object-contain w-24 h-24' /> 
                <div className='text-sm space-y-1'>
                    <div className='font-normal'>{data.display_name}</div>
                    <div className='text-muted-foreground'>{data.email}</div>
                </div>
            </div>
        </div>
    )
}