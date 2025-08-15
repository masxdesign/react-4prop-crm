import ExampleForm from '@/components/Magazine/ui/AgentEmailSearchField.example'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/example')({
  component: () => {
    return (
        <div>
            <ExampleForm />
        </div>
    )
  }
})