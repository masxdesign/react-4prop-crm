import { flushSync } from 'react-dom';
import { useAuth } from '@/components/Auth/Auth';
import { Toaster } from '@/components/ui/toaster';
import { Link, Outlet, createFileRoute, useMatches, useNavigate } from '@tanstack/react-router';
import { DatabaseIcon, ImportIcon, ListIcon, LogOut } from 'lucide-react';
import { last } from 'lodash';
import { EnvelopeClosedIcon, EnvelopeOpenIcon } from '@radix-ui/react-icons';
import FourPropIcon from "@/assets/4prop.svg?react"
import BizchatIcon from "@/assets/bizchat.svg?react"

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

  const matches = useMatches()

  const { title } = last(matches).context
  
  return (
    <>
      <div className='grid grid-cols-[8rem_1fr] gap-4 h-screen bg-gradient-to-l from-blue-900 to-blue-950'>
        <div className="flex flex-col gap-8 items-stretch text-sm text-white h-full bg-black/40">
            <span className='text-2xl font-bold text-emerald-500 p-3 tracking-tighter'>CRM</span>
            <div className='flex flex-col gap-2'>
              <Link to="each" className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center">
                  <DatabaseIcon className='size-5' />
                  <span className='opacity-60'>EACH</span>
              </Link>
              <Link to="list" className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center">
                  <ListIcon className='size-5' />
                  <span className='opacity-60'>Clients</span>
              </Link>
              <Link to="import" className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center">
                  <ImportIcon className='size-5' />
                  <span className='opacity-60'>Import</span>
              </Link>
              <Link to="/crm/user/active" className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center">
                  <EnvelopeOpenIcon className='size-5' />
                  <span className='opacity-60'>My inbox</span>
              </Link>
            </div>
            <div className='flex flex-col gap-2 mb-auto'>
              <h3 className='uppercase font-bold text-xs px-3 text-emerald-500 tracking-tighter'>Portals</h3>
              <Link to="https://4prop.com" className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center">
                  <FourPropIcon className='size-5' />
                  <span className='opacity-60'>4Prop</span>
              </Link>
              <Link to="https://4prop.com/bizchat/rooms" className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center">
                  <BizchatIcon className='size-5' />
                  <span className='opacity-60'>EACH Alert</span>
              </Link>
              <Link to="https://4prop.com/bizchat/rooms" className="pl-3 py-2 [&.active]:font-bold [&.active]:border-r-4 [&.active]:border-r-emerald-500 hover:no-underline flex gap-2 items-center">
                  <BizchatIcon className='size-5' />
                  <span className='opacity-60'>Bizchat</span>
              </Link>
            </div>
            {/* <div className='text-xs opacity-60 w-32 overflow-hidden truncate'>
              {auth.user.email}
            </div> */}
            <div
              variant="link"
              onClick={handleLogout}
              className="p-3 flex items-center justify-between gap-1 cursor-pointer hover:no-underline border-t border-t-sky-400/20"
            >
              <span className='opacity-60'>Logout</span>
              <LogOut className='size-5' />
            </div>
        </div>
        <div className='grid grid-rows-[3rem_1fr] min-h-0 py-4'>
          <div className='flex items-end py-4 gap-0 text-white px-3'>
              <div className='flex-1'>  
                <span className='text-xl font-bold'>
                  {title}
                </span>
              </div>
          </div>
          <div className='rounded-tl-2xl rounded-bl-2xl bg-white shadow-lg min-h-0 px-4 overflow-hidden'>
            <Outlet />
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}