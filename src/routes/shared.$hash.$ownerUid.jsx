import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shared/$hash/$ownerUid')({
  component: SharedComponent
})

function SharedComponent () {
  const { hash, ownerUid } = Route.useParams()

  return (
    <p>{hash} {ownerUid}</p>
  )
}