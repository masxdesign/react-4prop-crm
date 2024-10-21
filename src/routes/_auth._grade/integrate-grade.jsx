import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_grade/integrate-grade')({
  component: GradeQuestionsComponent
})

function GradeQuestionsComponent () {

    return (
        <div className='flex flex-col gap-3 max-w-[400px]'>

            <Button variant="outline">
                Save for myself
            </Button>
            <Button variant="outline" asChild>
                <Link to="../integrate-grade-share">
                    Share to client
                </Link>
            </Button>

        </div>
    )
}