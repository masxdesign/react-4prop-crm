import { LogOut } from 'lucide-react'
import { useNavigation } from './use-navigation'
import { NavLink } from './NavLink'

export function DashboardSidebar({ negId, onLogout, context }) {
  const { mainNavItems, portalItems } = useNavigation(negId)

  return (
    <div className="flex flex-col gap-8 items-stretch text-sm text-white h-full bg-black/40">
      <span className='text-2xl font-bold text-emerald-500 p-3 tracking-tighter'>
        CRM
      </span>
      
      <nav className='flex flex-col gap-2'>
        {mainNavItems.map((item) => (
          <NavLink 
            key={item.id}
            {...item}
            context={context}
          />
        ))}
      </nav>

      <div className='flex flex-col gap-2 mb-auto'>
        <h3 className='uppercase font-bold text-xs px-3 text-emerald-500 tracking-tighter'>
          Portals
        </h3>
        {portalItems.map((item) => (
          <NavLink 
            key={item.id}
            {...item}
            context={context}
          />
        ))}
      </div>

      <button
        onClick={onLogout}
        className="p-3 flex items-center justify-between gap-1 cursor-pointer hover:no-underline border-t border-t-sky-400/20"
      >
        <span className='opacity-60'>Logout</span>
        <LogOut className='size-5' />
      </button>
    </div>
  )
}