import PendingComponent from '@/components/PendingComponent'
import { createFileRoute } from '@tanstack/react-router'
import { useListImportIdQuery } from './list_.$import_id'
import { useQuery } from '@tanstack/react-query'
import { crmSharedPids } from '@/services/bizchat'
import { useAuth } from '@/components/Auth/Auth-context'
import useListing from '@/store/use-listing'
import PropertyDetail from '@/components/PropertyDetail'

export const Route = createFileRoute('/_auth/_dashboard/list/$import_id/shared')({
  component: ShareListComponent,
  pendingComponent: PendingComponent
})

function ShareListComponent () {

  const info = useListImportIdQuery()
  const shared = useShareListQuery()

  if (shared.isFetching) return null

  console.log(shared.data);
  

  return (
    <div className='border rounded-lg min-h-96 max-w-[1200px] mx-auto p-4 space-y-5'>
      <h1>
        <b>You shared {info.data.gradesharecount} properties</b> to {info.data.email}
      </h1>
      <div className='flex flex-wrap gap-3'>
        {shared.data.map(details => (
          <PropertyDetail 
            key={details.id}
            data={details}
            className="w-1/3 border p-3 rounded-sm shadow-md min-h-[140px]"
          />
        ))}
      </div>
    </div>
  )
}

export function useShareListQuery () {
  const auth = useAuth()

  const { import_id, tag_id = null } = Route.useParams()

  const resolveSharedPropDetailsQueryOptions = useListing.use.resolveSharedPropDetailsQueryOptions()

  const query = useQuery(resolveSharedPropDetailsQueryOptions(
    auth.authUserId,
    import_id,
    tag_id
  ))

  return query

}