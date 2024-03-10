import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/data/$dataset/add')({
  component: AddComponent
})

function AddComponent() {
  const { FormComponent, formProps } = Route.useRouteContext()

  return (
    <FormComponent {...formProps} />
  )
}