import { createFileRoute } from '@tanstack/react-router'
import { AccessSharedIndexComponent } from '@/routes/access.$hash.$ownerUid.shared.index'
import PendingComponent from '@/components/PendingComponent'

export const Route = createFileRoute('/access/$hash/$ownerUid/shared/$tag_id')({
  component: AccessSharedIndexComponent,
  pendingComponent: PendingComponent,
})