import { createFileRoute } from '@tanstack/react-router'
import PendingComponent from '@/routes/-ui/PendingComponent'

export const Route = createFileRoute('/_admin/_with-menu/dashboard/data/clients/add')({
    pendingComponent: PendingComponent,
    beforeLoad: async ({ params, context, navigate }) => {

        const { default: FormComponent } = await import('../-ui/ClientFormInsert')

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