import { useAuthStore } from '@/store';
import { Navigate, createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/logout')({
    component: logoutComponent
})

function logoutComponent() {
    const logout = useAuthStore.use.logout()
    useEffect(() => {
        logout()
    }, [])
    return <Navigate to='/crm/login' />
}