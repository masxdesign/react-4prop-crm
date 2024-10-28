import {
    createLazyFileRoute,
    useRouterState,
} from "@tanstack/react-router"
import { useGradeShareContext } from "@/routes/_auth.grade/_gradeWidget/$pid_.share"
import ImportSingleContactForm from "@/components/ImportSingleContactForm"

export const Route = createLazyFileRoute(
    "/_auth/grade/_gradeWidget/$pid/share/create-new"
)({
    component: AddClientComponent,
})

function AddClientComponent() {
    
    const { pid } = Route.useParams() 

    const { onConfirm } = useGradeShareContext()

    const { defaultEmail = "" } = useRouterState({
        select: (state) => state.location.state,
    })

    return (
        <ImportSingleContactForm 
            pid={pid}
            defaultEmail={defaultEmail}
            onSubmit={onConfirm}
            submitText="Next"
            backButtonText="Change selection"
            backButton
        />
    )
}