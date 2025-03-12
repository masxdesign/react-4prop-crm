import { useState } from 'react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import Logo from "@/assets/logo.svg?react"
import { Button } from '@/components/ui/button'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { ArrowLeft, CrossIcon, MoreHorizontal, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MagnifyingGlassIcon, StarFilledIcon } from '@radix-ui/react-icons'

export const Route = createFileRoute('/_auth/_com/user')({
  component: RouteComponent
})

const menuShared = [
    { id: "inactive", to: 'inactive', label: <X className='text-pink-300 size-5'/> },
    { id: "enquiries", to: 'active', search: { filters: { choice: null } }, mask: { to: 'active' }, includeSearch: true, label: <StarFilledIcon  className='text-amber-500 size-5'/> },
    { id: "rfi", to: '/crm/user/active', search: { filters: { choice: 2 } }, label: "RFI", mask: {
        to: '/crm/user/rfi'
    }, includeSearch: true },
    { id: "view", to: '/crm/user/active', search: { filters: { choice: 1 } }, label: "View", mask: {
        to: '/crm/user/view'
    }, includeSearch: true },
]

const menuAgent = [
    ...menuShared
]

const menuClient = [
    ...menuShared,
    { id: "email", to: 'email-agents', label: "Email agents" },
]

function RouteComponent() {
    const { origin, auth } = Route.useRouteContext()
    const menu = auth.isAgent ? menuAgent: menuClient

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
                            <MagnifyingGlassIcon className='size-5 scale-x-[-1]' />
                        </a>
                    </NavItem>
                    {origin && (
                        <NavItem asChild>
                            <a href={origin}>
                                <StarFilledIcon  className='text-slate-300 size-5'/>
                            </a>
                        </NavItem>
                    )}
                    
                    {menu.map((link) => (
                        <NavItem 
                            key={link.id} 
                            to={link.to}
                            mask={link.mask}
                            search={link.search}
                            activeOptions={{ exact: true, includeSearch: link.includeSearch ?? false }}
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
            className={cn('text-xs font-bold text-slate-400 border-b-[3px] border-transparent [&.active]:font-bold [&.active]:text-primary [&.active]:border-b-sky-700 px-3 py-3', className)}
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