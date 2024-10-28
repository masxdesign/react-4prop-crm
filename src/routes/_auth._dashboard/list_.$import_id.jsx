import { useAuth } from '@/components/Auth/Auth-context'
import PendingComponent from '@/components/PendingComponent'
import queryClient from '@/queryClient'
import { crmListById } from '@/services/bizchat'
import { queryOptions } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, useLoaderData, useRouterState } from '@tanstack/react-router'
import { cx } from 'class-variance-authority'
import { ArrowLeftCircleIcon } from 'lucide-react'

export const Route = createFileRoute('/_auth/_dashboard/list/$import_id')({
  component: ListImportIdComponent,
  pendingComponent: PendingComponent,
  loader: ({ context }) => queryClient.ensureQueryData(context.resolveContactDetails),
  beforeLoad ({ location, params, context }) {

    const { auth } = context
    const { import_id } = params
    const { lastLocation, info } = location.state ?? {}
    
    return {
        lastLocation,
        resolveContactDetails: {
            queryKey: ['infoById', import_id],
            queryFn: () => crmListById(import_id, auth.authUserId),
            initialData: info,
            enabled: !info
        }
    }
  }
})

function ListImportIdComponent () {
    const { lastLocation } = Route.useRouteContext()

    return (
        <div className='space-y-3'>
            <div className='flex items-center justify-center h-10 px-3'>
                {lastLocation && (
                    <Link 
                        to={lastLocation.pathname} 
                        search={lastLocation.search}
                        className={cx(
                            'flex flex-col items-center gap-1',
                            'text-sm text-slate-500', 
                            { 'opacity-50 pointer-events-none': !lastLocation }
                        )}
                    >
                        <ArrowLeftCircleIcon />
                        <span className='text-xs'>
                            Back to list
                        </span>
                    </Link>
                )}
            </div>
            <div className='p-3'>
                <Outlet />
            </div>
        </div>
    )
}