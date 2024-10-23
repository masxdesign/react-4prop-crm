import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from 'lucide-react'
import { useGradeShareContext } from '../$pid_.share'

export const Route = createFileRoute('/_auth/grade/$pid/share/_first_screen')({
  component: LayoutStep1Component
})

function LayoutStep1Component () {
    const { selected } = useGradeShareContext()
    const { location } = useRouterState()

    return (
        <div className='flex flex-col gap-3 max-w-[400px] relative'>
            <div className='flex gap-2 items-center'>
                <Link to=".." from={location.pathname}>
                    <ArrowLeftCircleIcon className='w-6 h-6 cursor-pointer' />
                </Link>
                {selected && (
                    <Link to="confirm" className='[&.active]:hidden'>
                        <ArrowRightCircleIcon className='w-6 h-6 cursor-pointer' />
                    </Link>
                )}
                <div className='border-r border-2 h-6' />
                <h2 className='font-bold text-md'>Grade and share this property</h2>
            </div>
            <Outlet />
        </div>
    )
}