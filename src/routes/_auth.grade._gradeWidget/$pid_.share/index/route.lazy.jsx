import {
    createLazyFileRoute,
    Link,
    useRouterState,
} from "@tanstack/react-router"
import ImportSingleContactForm from "@/components/ImportSingleContactForm"
import { useGradeShareContext } from "@/routes//_auth.grade._gradeWidget/$pid_.share"
import { ArrowRight } from "lucide-react"

export const Route = createLazyFileRoute(
    "/_auth/grade/_gradeWidget/$pid/share/"
)({
    component: AddClientComponent,
})

function AddClientComponent() {
    
    const { pid } = Route.useParams() 

    const { onConfirm, selected } = useGradeShareContext()

    const { defaultEmail = "" } = useRouterState({
        select: (state) => state.location.state,
    })

    return (
        <>
            <div className='flex gap-2 items-center'>
                <h2 className='font-bold text-md space-x-3'>
                    <span>Send this property to?</span>
                </h2>
                {selected && (
                    <Link to="confirm" className='[&.active]:hidden'>
                        <ArrowRight className='w-5 h-5 cursor-pointer' />
                    </Link>
                )}
            </div>
            <ImportSingleContactForm 
                pid={pid}
                defaultEmail={defaultEmail}
                onSubmit={onConfirm}
                submitText="Next"
            />
        </>
    )
}