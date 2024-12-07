import { createFileRoute, Link, Outlet, retainSearchParams } from '@tanstack/react-router'
import Logo from "@/assets/logo.svg?react"
import { Button } from '@/components/ui/button'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { decodeFromBinary } from '@/utils/binary'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_auth/integrate-send-enquiries')({
  component: RouteComponent,
  search: {
    middlewares: [retainSearchParams(['_origin'])],
  },
  beforeLoad: ({ search }) => {
    return {
        perpage: 8,
        origin: search._origin 
            ? `${FOURPROP_BASEURL}${decodeFromBinary(search._origin)}`
            : null
    }
  }
})

const menu = [
    { id: "email", to: '.', label: "Email agents" },
    { id: "enquiries", to: 'enquiries', label: "Active" },
    { id: "inactive", to: 'inactive', label: "Inactive" }
]

function RouteComponent() {
    const { origin } = Route.useRouteContext()

    return (
        <>
            <div className='sticky top-0 inset-x-0 bg-slate-50 z-20 flex px-4'>
                <Logo className="w-7 mr-4" />
                {origin && (
                    <Button variant="link" size="sm" className="self-center">
                        <a href={origin} className='flex gap-1 items-center'>
                            <ArrowLeft className='size-4' />
                            <span>back to listing</span>
                        </a>
                    </Button>
                )}
                <nav className='ml-auto flex gap-4 items-center justify-center'>
                    <NavItem asChild>
                        <a href={`${FOURPROP_BASEURL}/property-search`}>
                            New search
                        </a>
                    </NavItem>
                    
                    {menu.map((link) => (
                        <NavItem 
                            key={link.id} 
                            to={link.to}
                            activeOptions={{ exact: true, includeSearch: false }}
                        >
                            {link.label}
                            <span className='suffix'></span>
                        </NavItem>
                    ))}
                    
                </nav>
            </div>
            <div className='px-4 py-4 max-w-4xl mx-auto overflow-hidden'>
                <Outlet />
            </div>
        </>
    )
}

const NavItem = ({ className, asChild, ...props }) => {
    const Comp = asChild ? Slot: Link
    return (
        <Comp 
            className={cn('text-sm border-b-2 border-transparent [&.active]:font-bold [&.active]:text-primary [&.active]:border-b-primary px-3 py-3', className)}
            {...props}
        />
    )
}