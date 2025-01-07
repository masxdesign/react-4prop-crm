import { flushSync } from 'react-dom';
import { useAuth } from '@/components/Auth/Auth';
import { Toaster } from '@/components/ui/toaster';
import { Link, Outlet, createFileRoute, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dashboard')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const navigate = useNavigate({ from: '/dashboard' })

  const auth = useAuth()

  const handleLogout = async () => {
    await auth.logout()
    navigate({ to: '/crm/login' })
  }
  
  return (
    <>
       <div className="flex items-center gap-2 mb-2 py-2 px-3 border-b">
          <h1 className='font-bold text-sm mr-auto'>
            CRM
          </h1>
          <div className='flex items-center gap-6 text-sm'>
            <Link to="each" className="[&.active]:font-bold hover:underline">
                EACH
            </Link>
            <Link to="list" className="[&.active]:font-bold hover:underline">
                My list
            </Link>
            <Link to="import" className="[&.active]:font-bold hover:underline">
                Import
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