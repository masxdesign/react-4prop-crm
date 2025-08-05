import { useAuth } from '@/components/Auth/Auth';
import { Toaster } from '@/components/ui/toaster';
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router';
import { DashboardSidebar } from '@/components/DashboardSidebar/DashboardSidebar';

export const Route = createFileRoute('/_auth/_dashboard')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const navigate = useNavigate({ from: '/dashboard' })
  const auth = useAuth()

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
        <Outlet />
      </div>
      <Toaster />
    </>
  )
}