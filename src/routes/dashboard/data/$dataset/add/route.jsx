import PendingComponent from '@/routes/dashboard/-components/PendingComponent'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/data/$dataset/add')({
    pendingComponent: PendingComponent,
    beforeLoad: async ({ params, context, navigate }) => {
        const { default: FormComponent } = await import('@/components/Clientform/ClientFormInsert')

        const defaultValues = {
            company: '',
            phone: '',
            email: '',
            title: '',
            first: '',
            last: '',
            city: '',
            postcode: '',
            website: '',
            categories: []
        }

        const onSubmit = async () => {
            context.queryClient.invalidateQueries({ queryKey: [params.dataset] })
            navigate({ to: '../list' })
        }

        return {
            FormComponent,
            formProps: {
                defaultValues,
                onSubmit
            }
        }

    }
})