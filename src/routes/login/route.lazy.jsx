import { useState } from 'react';
import { useAuth } from '@/components/Auth/Auth';
import LoginForm from '@/components/LoginForm';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { flushSync } from 'react-dom';

export const Route = createLazyFileRoute('/login')({
    component: LoginComponent,
})

function LoginComponent() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const [errors, setErrors] = useState(null)

  const auth = useAuth()

  const handleSubmit = async (variables) => {
    try {

      await auth.loginSubmit(variables)

      console.log(search.redirect);
      

      navigate({ to: search.redirect })

    } catch (e) {

      setErrors({ root: e })

    }
  }

  return (
    <div className="container h-[800px] flex items-center justify-center">
      <div className="w-[400px] mx-auto space-y-6 rounded-[0.5rem] border bg-background shadow-md md:shadow-xl p-8">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        <LoginForm 
          onSubmit={handleSubmit} 
          isPending={auth.login.isPending}
          errors={errors}
          defaultEmail={search.email}
        />
      </div>
    </div>
  )
}