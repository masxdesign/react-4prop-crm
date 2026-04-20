import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Auth/Auth';
import { Toaster } from '@/components/ui/toaster';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Outlet, createFileRoute, useNavigate, useLocation } from '@tanstack/react-router';
import { DashboardSidebar } from '@/components/DashboardSidebar/DashboardSidebar';
import { Menu } from 'lucide-react';

export const Route = createFileRoute('/_auth/_dashboard')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const navigate = useNavigate({ from: '/dashboard' })
  const auth = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const context = {
    hash: auth.user?.hash,
  }

  const handleLogout = async () => {
    await auth.logout()
    navigate({ to: '/login' })
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 h-12 bg-linear-to-l from-blue-900 to-blue-950">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white p-1"
          aria-label="Open navigation"
        >
          <Menu className="size-6" />
        </button>
        <span className="text-lg font-bold text-emerald-500 tracking-tighter">CRM</span>
      </div>

      {/* Mobile sidebar drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-3/4 sm:max-w-[16rem] [&>button]:text-white/70 [&>button:hover]:text-white">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <DashboardSidebar
            negId={auth.user?.neg_id}
            onLogout={handleLogout}
            context={context}
          />
        </SheetContent>
      </Sheet>

      {/* Main layout */}
      <div className="grid grid-cols-1 md:grid-cols-[10rem_1fr] gap-0 md:gap-4 h-screen pt-12 md:pt-0">
        {/* Desktop sidebar */}
        <div className="hidden md:block min-h-0">
          <DashboardSidebar
            negId={auth.user?.neg_id}
            onLogout={handleLogout}
            context={context}
          />
        </div>
        <div className="min-h-0 h-full">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </>
  )
}
