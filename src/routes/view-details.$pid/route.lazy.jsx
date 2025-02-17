import { createLazyFileRoute } from '@tanstack/react-router'
import { useEnquiryList } from '../_auth._com/-ui/EnquiriesPage'
import Property from '@/features/messaging/components/Property'

export const Route = createLazyFileRoute('/view-details/$pid')({
  component: RouteComponent
})

function RouteComponent () {
  const { listQuery } = Route.useRouteContext()

  const data = useEnquiryList(listQuery)

  return (
    <Property data={data} />
  )
}