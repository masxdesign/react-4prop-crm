import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router';
import last from 'lodash/last';

export const Route = createFileRoute('/_auth/_dashboard/_layout-1')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const matches = useMatches()
  const { title } = last(matches).context
  
  return (
    <div className='grid grid-rows-[3rem_1fr] min-h-0 py-4'>
      <div className='flex items-end py-4 gap-0 text-white px-3'>
          <div className='flex-1'>  
            <span className='text-xl font-bold'>
              {title}
            </span>
          </div>
      </div>
      <div className='relative rounded-tl-2xl rounded-bl-2xl bg-white shadow-lg min-h-0 px-4 overflow-hidden'>
        <Outlet />
      </div>
    </div>
  )
}