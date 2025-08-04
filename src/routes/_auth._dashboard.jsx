import { flushSync } from 'react-dom';
import { useAuth } from '@/components/Auth/Auth';
import { Toaster } from '@/components/ui/toaster';
import { Link, Outlet, createFileRoute, useMatches, useNavigate } from '@tanstack/react-router';
import { DatabaseIcon, ImportIcon, ListIcon, LogOut } from 'lucide-react';
import { last } from 'lodash';
import { EnvelopeClosedIcon, EnvelopeOpenIcon } from '@radix-ui/react-icons';
import FourPropIcon from "@/assets/4prop.svg?react"
import BizchatIcon from "@/assets/bizchat.svg?react"
import { DashboardSidebar } from '@/components/DashboardSidebar/DashboardSidebar';

export const Route = createFileRoute('/_auth/_dashboard')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const navigate = useNavigate({ from: '/dashboard' })
  const auth = useAuth()
  const matches = useMatches()
  const { title } = last(matches).context

  const context = {
    hash: auth.user?.hash,
    // Add any other context variables needed for dynamic URLs
  }

  const handleLogout = async () => {
    await auth.logout()
    navigate({ to: '/crm/login' })
  }
  
  return (
    <>
      <div className='grid grid-cols-[8rem_1fr] gap-4 h-screen bg-gradient-to-l from-blue-900 to-blue-950'>
        <DashboardSidebar 
          negId={auth.user?.neg_id}
          onLogout={handleLogout}
          context={context}
        />
        <div className='grid grid-rows-[3rem_1fr] min-h-0 py-4'>
          <div className='flex items-end py-4 gap-0 text-white px-3'>
              <div className='flex-1'>  
                <span className='text-xl font-bold'>
                  {title}
                </span>
              </div>
          </div>
          <div className='relative rounded-tl-2xl rounded-bl-2xl bg-white shadow-lg min-h-0 px-4 overflow-hidden'>
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}