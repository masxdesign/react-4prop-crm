import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { ArrowLeft, ArrowLeftCircleIcon, ArrowRight, ArrowRightCircleIcon } from 'lucide-react'
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
                    <ArrowLeft className='w-5 h-5 cursor-pointer' />
                </Link>
                {selected && (
                    <Link to="confirm" className='[&.active]:hidden'>
                        <ArrowRight className='w-5 h-5 cursor-pointer' />
                    </Link>
                )}
                <div className='border-r border-2 h-6' />
                <h2 className='font-bold text-md space-x-3'>
                    <span>Share with CRM contact</span>
                    <span className='inline-block px-2 py-1 font-bold bg-yellow-300 text-orange-800 rounded-sm text-xs'>crm</span>
                </h2>
            </div>
            <Outlet />
        </div>
    )
}