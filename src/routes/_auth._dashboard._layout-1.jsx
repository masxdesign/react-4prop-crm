import { Outlet, createFileRoute, useMatches } from '@tanstack/react-router';
import last from 'lodash/last';

export const Route = createFileRoute('/_auth/_dashboard/_layout-1')({
    component: dashboardComponent,
})

function dashboardComponent() {
  const matches = useMatches()
  const { title } = last(matches).context
  
  return (
    <div className='grid grid-rows-[3rem_1fr] min-h-0 py-2 md:py-4'>
      <div className='flex items-end py-4 gap-0 text-white px-3'>
          <div className='flex-1'>  
            <span className='text-xl font-bold'>
              {title}
            </span>
          </div>
      </div>
      <div className='relative rounded-2xl md:rounded-tr-none md:rounded-br-none bg-white shadow-lg min-h-0 px-2 md:px-4 overflow-hidden'>
        <Outlet />
      </div>
    </div>
  )
}