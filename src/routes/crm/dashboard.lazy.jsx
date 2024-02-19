import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store';
import { Link, Outlet, createLazyFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/crm/dashboard')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const logout = useAuthStore.use.logout()
  const navigate = useNavigate({ from: '/crm/dashboard/' })

  const handleLogout = () => {
    logout()
    navigate({ to: '/crm/login' })
  }
  
  return (
    <>
       <div className="flex items-center gap-2 p-2">
          <Link to="/crm/dashboard" className="[&.active]:font-bold mr-auto">
            Dashboard
          </Link>
          <Button
            variant="link"
            onClick={handleLogout}
          >
            Logout
          </Button>
      </div>
      <hr />
      <br />
      <div className="container space-y-4">
        <div className='flex justify-start gap-4 px-4'>
          <Link to="/crm/dashboard/" className="[&.active]:font-bold">
            list
          </Link>
          <Link to="/crm/dashboard/add" className="[&.active]:font-bold">
            add
          </Link>
          <Link to="/crm/dashboard/import" className="[&.active]:font-bold">
            import
          </Link>
        </div>
        <div className='overflow-hidden rounded-[0.5rem] border bg-background shadow-md md:shadow-xl p-8'>
          <Outlet />
        </div>
      </div>
      <Toaster />
    </>
  )
}