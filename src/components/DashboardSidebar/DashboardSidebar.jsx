import { LogOut } from 'lucide-react'
import { useNavigation } from './use-navigation'
import { NavLink } from './NavLink'
import { useAuth } from '../Auth/Auth-context'

export function DashboardSidebar({ negId, onLogout, context }) {
  const auth = useAuth()
  const { mainNavItems, portalItems, magazineItems, adminItems } = useNavigation(negId, auth)

  return (
    <div className="flex flex-col gap-8 items-stretch text-sm text-white h-full bg-black/40 bg-linear-to-l from-blue-900 to-blue-950">
      <div className='p-3'>
        <span className='text-2xl font-bold text-emerald-500 tracking-tighter'>
          CRM
        </span>
        <div className='mt-2 flex flex-col gap-1'>
          <span className='text-xs text-white/70 truncate'>{auth.displayName}</span>
          <span className='text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-400 w-fit'>
            {auth.user?.is_admin ? 'Admin' : auth.isAgent ? 'Agent' : auth.isAdvertiser ? 'Advertiser' : 'User'}
          </span>
        </div>
      </div>

      <nav className='flex flex-col gap-2'>
        {mainNavItems.map((item) => (
          <NavLink 
            key={item.id}
            {...item}
            context={context}
          />
        ))}
      </nav>

      {magazineItems.length > 0 && (
        <div className='flex flex-col gap-2'>
          <h3 className='uppercase font-bold text-xs px-3 text-emerald-500 tracking-tighter'>
            Marketing
          </h3>
          {magazineItems.map((item) => (
            <NavLink 
              key={item.id}
              {...item}
              context={context}
            />
          ))}
        </div>
      )}

      {adminItems.length > 0 && (
        <div className='flex flex-col gap-2'>
          <h3 className='uppercase font-bold text-xs px-3 text-emerald-500 tracking-tighter'>
            Admin
          </h3>
          {adminItems.map((item) => (
            <NavLink
              key={item.id}
              {...item}
              context={context}
            />
          ))}
        </div>
      )}

      <div className='flex flex-col gap-2'>
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

      <div className='mt-auto shrink-0 py-1 px-1 border-t border-t-sky-400/20'>
        <button
          onClick={onLogout}
          className="w-full px-3 py-3 flex items-center justify-between gap-1 cursor-pointer hover:no-underline"
        >
          <span className='opacity-60'>Logout</span>
          <LogOut className='size-4' />
        </button>
      </div>
    </div>
  )
}