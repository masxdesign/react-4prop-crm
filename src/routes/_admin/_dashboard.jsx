import { flushSync } from 'react-dom';
import { useAuth } from '@/components/Auth/Auth-context';
import { Toaster } from '@/components/ui/toaster';
import { Link, Outlet, createFileRoute, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';

export const Route = createFileRoute('/_admin/_dashboard')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const navigate = useNavigate({ from: '/dashboard' })

  const auth = useAuth()

  const handleLogout = async () => {
    await auth.logout.mutateAsync()
    flushSync(() => {
      auth.setUser(null)
    })
    navigate({ to: '/crm/login' })
    console.log({navigate});
  }
  
  return (
    <>
       <div className="flex items-center gap-2 mb-2 py-2 px-3 border-b">
          <h1 className='font-bold text-sm mr-auto'>
            CRM
          </h1>
          <div className='flex items-center gap-6 text-sm'>
            <Link to="data/each/list" className="[&.active]:font-bold hover:underline">
                EACH
            </Link>
            <Link to="data/clients/list" className="[&.active]:font-bold hover:underline">
                Clients
            </Link>
            <div
              variant="link"
              onClick={handleLogout}
              className="flex items-center gap-1 cursor-pointer hover:underline"
            >
              <LogOut className='h-3 w-3' />
              Logout
            </div>
          </div>
      </div>
      <Outlet />
      <Toaster />
    </>
  )
}