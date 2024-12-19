import { createFileRoute, Link, Outlet, retainSearchParams } from '@tanstack/react-router'
import Logo from "@/assets/logo.svg?react"
import { Button } from '@/components/ui/button'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { decodeFromBinary } from '@/utils/binary'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { ArrowLeft, MoreHorizontal } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'

export const Route = createFileRoute('/_auth/integrate-send-enquiries')({
  component: RouteComponent,
  search: {
    middlewares: [retainSearchParams(['_origin'])],
  },
  beforeLoad: ({ search }) => {

    let origin = null

    if (search._origin) {
        origin = new URL(`${FOURPROP_BASEURL}${decodeFromBinary(search._origin)}`)
    }

    return {
        perpage: 8,
        origin
    }
    
  }
})

const menu = [
    { id: "email", to: '.', label: "Email agents" },
    { id: "enquiries", to: 'active', label: "Active" },
    { id: "inactive", to: 'inactive', label: "Inactive" }
]

function RouteComponent() {
    const { origin } = Route.useRouteContext()

    return (
        <>
            <div className='sticky top-0 inset-x-0 bg-slate-50 z-20 flex items-center px-4'>
                <a href={FOURPROP_BASEURL} className='mr-4'>
                    <Logo className="w-7" />
                </a>
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
                    
                    <MoreOptionsMenuItem />
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
            className={cn('text-sm border-b border-transparent [&.active]:font-bold [&.active]:text-primary [&.active]:border-b-primary px-3 py-3', className)}
            {...props}
        />
    )
}

const SubNavItem = ({ className, asChild, ...props }) => {
    const Comp = asChild ? Slot: Link
    return (
        <Comp 
            className={cn('rounded-md text-sm hover:bg-slate-100 [&.active]:font-bold [&.active]:bg-slate-100 px-3 py-3', className)}
            {...props}
        />
    )
}

const MoreOptionsMenuItem = () => {
    const [open, setOpen] = useState(false)
    
    const handleClick = () => {
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
                <MoreHorizontal />
            </PopoverTrigger>
            <PopoverContent onClick={handleClick} className="p-2 flex gap-2 flex-col max-w-64">
                {/* <SubNavItem to="update details">
                    Update personal details
                </SubNavItem> */}
                <SubNavItem to="rename-search-reference">
                    Rename search references
                </SubNavItem>
            </PopoverContent>
        </Popover>
    )
}