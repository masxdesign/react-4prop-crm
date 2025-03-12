import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useEnquiryList } from '../_auth._com/-ui/EnquiriesPage'
import Property from '@/features/messaging/components/Property'
import { produce } from 'immer'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { EnvelopeClosedIcon } from '@radix-ui/react-icons'

export const Route = createLazyFileRoute('/view-details/$pid')({
  component: RouteComponent
})

function RouteComponent () {
  const { listQuery, onGradeChange, queryClient, auth } = Route.useRouteContext()

  const { data, list } = useEnquiryList(listQuery)
  const row = list[0]

  useEffect(() => {

    window.scrollTo({ top: 0, behavior: 'instant' })

  }, [])

  const handleDealingAgentFirstMessage = (message) => {
    queryClient.setQueryData(listQuery.queryKey, (prev) => {
        return produce(prev, (draft) => {
            const item = draft.results.find((r) => r.pid === message._property.id)

            if (item) {
              item.dealing_agents_chat_id = message.chat_id
            }  
        })
    })
  }

  return (
    <>
      <Property
        row={row} 
        isAgent={auth.isAgent} 
        bz_hash={auth.user.bz_hash} 
        onGradeChange={onGradeChange} 
        onDealingAgentFirstMessage={handleDealingAgentFirstMessage}
      />
      <div className='sticky bottom-0 p-8 float-right'>
        <Button size="lg" className="flex flex-col gap-1 h-16" asChild>
          <Link to={`/crm/user/active`}>
            <EnvelopeClosedIcon className='size-6' />
            <span>All enquiries</span>
          </Link>
        </Button>
      </div>
    </>
  )
}