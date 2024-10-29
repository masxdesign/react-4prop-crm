import PendingComponent from '@/components/PendingComponent'
import { createFileRoute, Link, Outlet, useLoaderData, useNavigate, useRouteContext } from '@tanstack/react-router'
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/Auth/Auth-context'
import useListing from '@/store/use-listing'
import PropertyDetail from '@/components/PropertyDetail'
import GradingWidget from '@/components/GradingWidget'
import { useSharedTagListQueryOptions } from './tags'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { cx } from 'class-variance-authority'
import { UserCard } from '@/components/CRMTable/components'
import { Route as AuthDashboardListRouteImport } from '@/routes/_auth._dashboard/list/route'
import { find } from 'lodash'
import { useImportIdQuery, useResolveContactDetailsQuery } from '@/routes/_auth._dashboard/list_.$import_id'

export const Route = createFileRoute('/_auth/_dashboard/list/$import_id/shared')({
  component: ShareListComponent,
  pendingComponent: PendingComponent
})

function ShareListComponent () {
  const auth = useAuth()
  const { tag_id } = Route.useParams()
  const { data } = useShareListSuspenseQuery(auth.authUserId)
  const { data: tag } = useTagsSuspenseQuery(auth.authUserId, data => find(data, { id: tag_id }))

  return (
    <div className='flex gap-8 max-w-[1400px] mx-auto'>
      <div className='space-y-5 w-2/3'>
        <h2 className='flex items-center text-3xl space-x-4'>
          <span className='font-bold'>You shared</span>
          <span className='text-slate-500 text-sm py-1 px-2 rounded-lg border border-slate-400 space-x-2'>
            {tag && <span>{tag.name}</span>}
            <span className='font-normal'>{data.length}</span>
          </span>
        </h2>
        <Outlet />
      </div>
      <div className='space-y-4 w-1/3'>
        <div className='border rounded-lg p-8 space-y-4 self-start'>
          <h2 className='font-bold text-lg'>Filter by tag</h2>
          <Suspense fallback={<Loader2 className='animate-spin' />}>
            <Tags authUserId={auth.authUserId} />
          </Suspense>
        </div>
        <div className='border rounded-lg p-8 space-y-4 self-start'>
          <Suspense fallback={<Loader2 className='animate-spin' />}>
            <ContactUserCard />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export function useShareListQueryOptions (authUserId) {
  const { tag_id = null } = Route.useParams()

  const import_id = useImportIdQuery()

  const resolveSharedPropDetailsQueryOptions = useListing.use.resolveSharedPropDetailsQueryOptions()

  return resolveSharedPropDetailsQueryOptions(
    authUserId,
    import_id,
    tag_id
  )
}

export function ContactUserCard () {
  const { lastLocation } = Route.useRouteContext()
  const navigate = useNavigate()
  const query = useResolveContactDetailsQuery()

  const handleView = data => {
    if (lastLocation) {
      navigate({ 
        to: lastLocation.pathname, 
        search: lastLocation.search
      })
      return
    }

    navigate({ 
      to: AuthDashboardListRouteImport.fullPath, 
      search: {
        open: true,
        info: data.id
      }
    })
  }
  
  return (
    <UserCard 
      data={query.data} 
      onView={handleView}
      clickable
    />
  )
}

export function useTagsSuspenseQuery (authUserId, select = null) {
  const import_id = useImportIdQuery()

  const tagListQueryOptions = useSharedTagListQueryOptions(authUserId, import_id)
  const query = useSuspenseQuery({
    ...tagListQueryOptions,
    select
  })

  return query
}

export function Tags ({ authUserId }) {
  const query = useTagsSuspenseQuery(authUserId)

  return (
    <div className='flex flex-wrap gap-2 text-sm'>
      <TagItem tag={{ name: 'All', id: "." }} />
      {query.data.map(tag => (
        <TagItem 
          key={tag.id} 
          tag={tag}
        />
      ))}
    </div>
  )
}

function TagItem ({ tag }) {
  return (
    <Link 
      to={tag.id}
      from={Route.fullPath}
      activeOptions={{ exact: true }}
      className={cx(
        'rounded-lg cursor-pointer inline-block px-3 py-2', 
        'border-transparent bg-sky-100/80 text-sky-500 hover:bg-sky-100',
        '[&.active]:font-bold [&.active]:border [&.active]:border-sky-500 [&.active]:!bg-transparent'
      )}
    >
      {tag.name}
    </Link>
  )
}

export function useShareListSuspenseQuery (authUserId) {
  const shareListQueryOptions = useShareListQueryOptions(authUserId)
  const query = useSuspenseQuery(shareListQueryOptions)
  return query
}

export function List ({ authUserId }) {
  const query = useShareListSuspenseQuery(authUserId)

  return query.data.map(details => (
    <div key={details.id} className='w-full lg:w-1/2 p-2'>
      <div 
        className="flex gap-4 border p-4 rounded-lg shadow-md min-h-[180px]"
      >
        <div>
          <GradingWidget 
              size={20} 
              value={details.shared.grade}
              className="grow"
          />
        </div>
        <div className='min-w-0'>
          <PropertyDetail 
            key={details.id}
            data={details}
          />
        </div>
      </div>
    </div>
  ))
}