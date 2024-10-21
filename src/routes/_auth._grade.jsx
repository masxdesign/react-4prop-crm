import GradingWidget from '@/components/GradingWidget'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_grade')({
  component: LayoutGradeComponent
})

function LayoutGradeComponent () {

    const { defaultGrade = 0 } = Route.useSearch()

    return (
        <div className="p-3">
            <div className='flex gap-3'>
                <div>
                    <GradingWidget 
                        size={30} 
                        defaultGrade={defaultGrade}
                        className="sticky top-3 left-0 z-10"
                    />
                </div>
                <div className='grow px-3'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}