import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_auth/grade/_gradeWidget/$pid/crm-promo')({
  component: PromoComponent
})

function PromoComponent () {
    const { location } = useRouterState()

    return (
        <>
            <Link to=".." from={location.pathname} className='flex gap-2 text-sm text-muted-foreground items-center'>
                <ArrowLeft className='w-5 h-5 cursor-pointer' />
                <span>back</span>
            </Link>
            <div className='p-4 text-center text-lg space-y-4 font-bold'>
                <div className='flex gap-3 items-center justify-center'>
                    <span className='inline-block px-2 py-1 font-bold bg-yellow-300 text-orange-800 rounded-md text-lg'>CRM</span>
                    <span className='text-orange-800/50 text-sm font-normal'>for EACH Agent</span>
                </div>
                <p className='text-slate-800'>
                    We launching our new service very soon
                </p>
                <p className='text-slate-500'>
                    Stay tuned :D
                </p>
            </div>
        </>
    )
}