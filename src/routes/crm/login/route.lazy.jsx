import LoginForm from '@/components/LoginForm';
import { createLazyFileRoute, getRouteApi, useNavigate } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/crm/login')({
    component: LoginComponent,
})

function LoginComponent() {
  const navigate = useNavigate()
  const search = Route.useSearch()

  const handleSuccess = () => {
    navigate({ to: search.redirect })
  }

  return (
    <div className="container h-[800px] flex items-center justify-center">
      <div className="w-[400px] mx-auto space-y-6 rounded-[0.5rem] border bg-background shadow-md md:shadow-xl p-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}