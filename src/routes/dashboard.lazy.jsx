import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store';
import { Link, Outlet, createLazyFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/dashboard')({
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
      <Outlet />
      <Toaster />
    </>
  )
}