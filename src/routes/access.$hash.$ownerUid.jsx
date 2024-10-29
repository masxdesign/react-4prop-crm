import { createFileRoute, Outlet, useRouteContext } from '@tanstack/react-router'
import { crmContactByHash, crmOwnerUidInfo } from '@/services/bizchat'
import queryClient from '@/queryClient'
import PendingComponent from '@/components/PendingComponent'
import { ContactUserCard } from '@/routes/_auth._dashboard/list_.$import_id.shared'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { FOURPROP_BASEURL } from '@/services/fourProp'

export const Route = createFileRoute('/access/$hash/$ownerUid')({
  component: ParentAccessComponent,
  pendingComponent: PendingComponent,
  loader: ({ context }) => Promise.all([
    queryClient.ensureQueryData(context.resolveContactDetails),
    queryClient.ensureQueryData(context.ownerQueryOptions)
  ]),
  beforeLoad ({ location, params, context }) {

    const { hash, ownerUid } = params
    const { lastLocation, info } = location.state ?? {}

    const initialOwner = context.auth?.authUserId === ownerUid ? context.auth.user: undefined

    return {
      lastLocation,
      isAuthPreview: context.auth.authUserId === ownerUid,
      resolveContactDetails: {
        queryKey: ['crmContactByHash', ownerUid, hash],
        queryFn: () => crmContactByHash(ownerUid, hash),
        initialData: info,
        enabled: !info
      },
      ownerQueryOptions: {
        queryKey: ['crmOwnerUidInfo', ownerUid],
        queryFn: () => crmOwnerUidInfo(ownerUid),
        initialData: initialOwner,
        enabled: !initialOwner
      }
    }
  }
})

function ParentAccessComponent () {
  const { isAuthPreview } = Route.useRouteContext()
  const owner = Route.useLoaderData({ select: ([_, owner]) => owner })

  return (
    <div className='space-y-3'>
        {isAuthPreview && (
          <div className='bg-slate-200 mb-3 pb-2'>
            <div className='text-center text-sm p-1 text-orange-800 mb-3'>This is only a preview for</div>
            <div className='w-[380px] mx-auto p-4 bg-white rounded-md shadow-md mb-4'>
              <Suspense fallback={<Loader2 className='animate-spin' />}>
                <ContactUserCard />
              </Suspense>
            </div>
          </div>
        )}
        <div className='p-4 border-b'>
          <div className='flex gap-3 items-center max-w-[1400px] mx-auto'>
            <img 
              src={`${FOURPROP_BASEURL}/${owner.company.logo}`} 
              className='grayscale brightness-125 rounded-full object-contain w-16 h-16' 
            />
            <span className='text-sm font-bold'>{owner.company.name}</span>
          </div>
         
        </div>
        <Outlet />
    </div>
  )
}