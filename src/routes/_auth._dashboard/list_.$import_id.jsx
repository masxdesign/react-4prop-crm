import { useAuth } from '@/components/Auth/Auth-context'
import PendingComponent from '@/components/PendingComponent'
import { crmListById } from '@/services/bizchat'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { cx } from 'class-variance-authority'

export const Route = createFileRoute('/_auth/_dashboard/list/$import_id')({
  component: ListImportIdComponent,
  pendingComponent: PendingComponent
})

function ListImportIdComponent () {
    const { lastLocation } = useListImportIdLocationState()

    return (
        <div className='space-y-5'>
            <div className='flex items-center justify-start px-3'>
                {lastLocation && (
                    <Link 
                        to={lastLocation.pathname} 
                        search={lastLocation.search}
                        className={cx('text-sm', { 'opacity-50 pointer-events-none': !lastLocation })}
                    >
                        Back to list
                    </Link>
                )}
            </div>
            <div className='p-3'>
                <Outlet />
            </div>
        </div>
    )
}

export function useListImportIdLocationState () {
    const { location } = useRouterState()
    const { lastLocation, info } = location.state ?? {}
    return { lastLocation, info}
}

export function useListImportIdQuery () {
    const auth = useAuth()
    const { import_id } = Route.useParams()

    const { info = null } = useListImportIdLocationState()

    const query = useQuery({
        queryKey: ['infoById', import_id],
        queryFn: () => crmListById(import_id, auth.authUserId),
        initialData: info,
        enabled: !info
    })

    return query
}