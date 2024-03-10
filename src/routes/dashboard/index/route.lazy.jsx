import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/dashboard/')({
    component: indexComponent
})

function indexComponent() {

  return (
    <>
      <p>hello</p>
    </>
  )
}