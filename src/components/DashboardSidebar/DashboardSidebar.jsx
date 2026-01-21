import { useState } from 'react'
import { LogOut, UserCog, ArrowLeftRight } from 'lucide-react'
import { useNavigation } from './use-navigation'
import { NavLink } from './NavLink'
import { useAuth } from '../Auth/Auth-context'
import { useImpersonation } from '@/hooks/useImpersonation'
import { ImpersonateDialog } from '../Impersonation'

export function DashboardSidebar({ negId, onLogout, context }) {
  const auth = useAuth()
  const { isImpersonating, exitImpersonation, isExitPending } = useImpersonation()
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false)
  const { mainNavItems, portalItems, magazineItems, adminItems } = useNavigation(negId, auth)

  // Admin can impersonate (even while already impersonating to switch users)
  const canImpersonate = auth.user?.is_admin || isImpersonating

  return (
    <div className="flex flex-col gap-8 items-stretch text-sm text-white h-full bg-black/40 bg-linear-to-l from-blue-900 to-blue-950">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-amber-500 text-amber-950 px-3 py-2 text-xs font-medium flex items-center justify-between">
          <span>Viewing as {auth.displayName}</span>
        </div>
      )}

      <div className='p-3'>
        <span className='text-2xl font-bold text-emerald-500 tracking-tighter'>
          CRM
        </span>
        <div className='mt-2 flex flex-col gap-1'>
          <span className='text-xs text-white/70 truncate'>
            {auth.displayName}
            {isImpersonating && (
              <span className="text-amber-400 ml-1">(Impersonating)</span>
            )}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit ${
            isImpersonating
              ? 'bg-amber-600/30 text-amber-400'
              : 'bg-emerald-600/30 text-emerald-400'
          }`}>
            {auth.user?.is_admin ? 'Admin' : auth.isAgent ? 'Agent' : auth.isAdvertiser ? 'Advertiser' : 'User'}
          </span>
        </div>

        {/* Impersonation Controls */}
        {canImpersonate && (
          <div className="mt-3 flex flex-col gap-1">
            <button
              onClick={() => setImpersonateDialogOpen(true)}
              className="w-full text-left px-2 py-1.5 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded flex items-center gap-2"
            >
              <UserCog className="h-3 w-3" />
              Impersonate
            </button>

            {isImpersonating && (
              <button
                onClick={() => exitImpersonation()}
                disabled={isExitPending}
                className="w-full text-left px-2 py-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded flex items-center gap-2"
              >
                <ArrowLeftRight className="h-3 w-3" />
                {isExitPending ? 'Switching...' : 'Switch Back'}
              </button>
            )}
          </div>
        )}
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

      {/* Impersonate Dialog */}
      <ImpersonateDialog
        open={impersonateDialogOpen}
        onOpenChange={setImpersonateDialogOpen}
      />
    </div>
  )
}