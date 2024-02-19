import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/crm/dashboard/add')({
  component: AddComponent,
})

function AddComponent() {
  return <div className="p-2">Hello!</div>
}