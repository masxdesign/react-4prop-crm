import PendingComponent from '@/components/PendingComponent'
import { createFileRoute, Link, Outlet, useLoaderData, useNavigate, useRouteContext, useRouterState } from '@tanstack/react-router'
import { useQueries, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/Auth/Auth'
import useListing from '@/store/use-listing'
import PropertyDetail from '@/components/PropertyDetail'
import GradingWidget from '@/components/GradingWidget'
import { Suspense } from 'react'
import { FilterIcon, Loader2, TagIcon, User } from 'lucide-react'
import { cx } from 'class-variance-authority'
import { UserCard } from '@/components/CRMTable/components'
import { Route as AuthDashboardListRouteImport } from '@/routes/_auth._dashboard/list/route'
import { find } from 'lodash'
import { useImportIdQuery, useResolveContactDetailsQuery } from '@/routes/_auth._dashboard/list_.$import_id'
import { BASEPATH, WINDOWN_NAMES } from '@/constants'
import { sharedTagListQueryOptions } from '@/features/tags/queryOptions'

export const Route = createFileRoute('/_auth/_dashboard/list/$import_id/shared')({
  component: ShareListComponent,
  pendingComponent: PendingComponent,
  beforeLoad () {
    return {
      parentRouteFullPath: Route.fullPath,
    }
  }
})

function ShareListComponent () {
  const auth = useAuth()

  return (
    <SharedListPage 
      authUserId={auth.authUserId}
      from_uid={auth.user.id}
      list={<Outlet />} 
      sidebarBlock={
        <Suspense fallback={<Loader2 className='animate-spin' />}>
          <>
            <h2 className='flex gap-3 font-bold text-lg'>
              <User />
              <span>Contact</span>
            </h2>
            <ContactUserCard />
          </>
        </Suspense>
      }
    />
  )
}

export function SharedListPage ({ authUserId, from_uid, list, sidebarBlock }) {
  const { tag_id } = Route.useParams()
  const { data } = useShareListSuspenseQuery(authUserId)
  const { data: tag } = useTagsSuspenseQuery(from_uid, data => find(data, { id: tag_id }))

  return (
    <div className='flex gap-8 max-w-[1400px] mx-auto'>
      <div className='space-y-5 w-2/3'>
        <h2 className='flex items-center text-3xl space-x-4'>
          <span className='font-bold'>Shared</span>
          <span className='text-slate-500 text-sm py-1 px-2 rounded-lg border border-slate-400 space-x-2'>
            {tag && <span>{tag.name}</span>}
            <span className='font-normal'>{data.length}</span>
          </span>
        </h2>
        <div>
          {list}
        </div>
      </div>
      <div className='space-y-4 w-1/3'>
        <div className='border rounded-lg p-8 space-y-5 self-start'>
          <h2 className='flex gap-3 font-bold text-lg'>
            <TagIcon />
            <span>Filter by tag</span>
          </h2>
          <Suspense fallback={<Loader2 className='animate-spin' />}>
            <Tags from={from} />
          </Suspense>
        </div>
        <div className='border rounded-lg p-8 space-y-5 self-start'>
          {sidebarBlock}
        </div>
      </div>
    </div>
  )
}

export function useShareListQueryOptions (from) {
  const { tag_id = null } = Route.useParams()

  const import_id = useImportIdQuery()

  const resolveSharedPropDetailsQueryOptions = useListing.use.resolveSharedPropDetailsQueryOptions()

  return resolveSharedPropDetailsQueryOptions(
    from,
    import_id,
    tag_id
  )
}

export function ContactUserCard () {
  const { lastLocation } = useRouteContext()
  const navigate = useNavigate()
  const query = useResolveContactDetailsQuery()

  const handleView = data => {

    const myNavigate = (opts) => {
      if (window.name === WINDOWN_NAMES.auth) return navigate(opts)
      const url = new URL(BASEPATH + opts.to, window.location.origin)
      Object.entries(opts.search).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
      console.log(url);
      
      window.open(url, WINDOWN_NAMES.auth)
    }

    if (lastLocation) {
      myNavigate({ 
        to: lastLocation.pathname, 
        search: lastLocation.search
      })
      return
    }

    myNavigate({ 
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

export function useTagsSuspenseQuery (from_uid, select = null) {
  const import_id = useImportIdQuery()

  const query = useSuspenseQuery({
    ...sharedTagListQueryOptions(from_uid, import_id),
    select
  })

  return query
}

export function Tags ({ from }) {
  const query = useTagsSuspenseQuery(from)

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
  const { lastLocation, parentRouteFullPath } = useRouteContext()

  return (
    <Link 
      to={tag.id}
      from={parentRouteFullPath}
      state={{ lastLocation }}
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

export function useShareListSuspenseQuery (from) {
  const shareListQueryOptions = useShareListQueryOptions(from)
  const query = useSuspenseQuery(shareListQueryOptions)
  return query
}

export function List ({ from }) {
  const query = useShareListSuspenseQuery(from)

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
            data={details}
          />
        </div>
      </div>
    </div>
  ))
}