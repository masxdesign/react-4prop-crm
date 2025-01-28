import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { User } from 'lucide-react'

function EnquiryGradingMessagingList({ 
    list,
    renderLeftSide,
    renderRightSide,
    rowClassName,
    gradingComponent: Grading,
    context
}) {
    return list.map((row, index) => {
      const { id, title, statusColor, statusText, sizeText, tenureText, thumbnail, content } = row

      return (
        <div key={id} className={cn("space-y-4 p-4", rowClassName)}>
          {row.client && <ClientContactInformation client={row.client} />}
          <div className='flex gap-8'>
            <div className='flex flex-col gap-4 basis-1/5 overflow-hidden'>
              <div className='flex items-start gap-4'>
                <div>
                  {Grading && <Grading row={row} context={context} />}
                </div>
                <div className='bg-gray-200 size-10 sm:size-28'>
                  <img src={thumbnail} className='object-cover w-full h-full' />
                </div>
              </div>
              {renderLeftSide?.(row, index)}
            </div>
            <div className="flex-1 space-y-3 sm:space-y-2 text-sm">
              <div className='flex gap-4'>
                <div className='flex-1 flex flex-col gap-2'>
                  <a 
                    href={`${FOURPROP_BASEURL}/view-details/${id}`} 
                    target="_blank" 
                    className='font-bold hover:underline'
                  >
                    {title}
                  </a>
                  <div className='flex flex-col sm:flex-row gap-0 sm:gap-3'>
                    <div className={cn("font-bold", { 
                      "text-green-600": statusColor === "green",
                      "text-amber-600": statusColor === "amber",
                      "text-sky-600": statusColor === "sky",
                      "text-red-600": statusColor === "red",
                    })}>
                      {statusText}
                    </div>
                    <div>{sizeText}</div>
                    <div>{tenureText}</div>
                  </div>
                  <div className="opacity-60 truncate max-w-[360px] min-h-[20px]">
                    {content.teaser}
                  </div>            
                </div>
                <div className='basis-1/5 self-start flex flex-col gap-1'>
                    {row.companies[0] && (
                      <PropertyCompany
                        logo={row.companies[0].logo.original}
                        name={row.companies[0].name}
                      />
                    )}
                </div>
              </div>
              {renderRightSide?.(row, index)}
            </div>
          </div>                
        </div>
      )
    })
}

function PropertyCompany({ logo, name }) {
  return (
    <>
      <div className='text-xs text-center text-muted-foreground'>{name}</div>
      {logo ? (
        <div className='bg-slate-50 p-2 w-full flex justify-center items-center self-start'>
          <img src={logo} className='max-h-12 object-cover' />
        </div>
      ) : (
        <div className='bg-slate-50 p-2 flex items-center justify-center font-bold text-slate-400 h-12'>
          <span>No logo</span>
        </div>
      )}
    </>
  )
}

function ClientContactInformation({ client }) {
  return (
    <div className='flex items-center gap-4 text-xs border-b px-4 pb-2 -mt-2 -mx-4 shadow-sm rounded-md'>
      <div className='flex gap-2 items-center text-muted-foreground'>
        <User className='size-3'/>
        <span>Client</span>
      </div>
      <div>{client.phone}</div>
      <div className='ml-auto flex gap-8 items-center'>

        <div className='flex gap-2 items-center'>
          <div className='font-bold'>Sent by</div>
          <div>{client.display_name}</div>
          <div className='bg-slate-50 size-5 rounded-full overflow-hidden flex justify-center items-center self-start'>
            <img src={`${FOURPROP_BASEURL}${client.avatar_sm}`} className='max-h-12 object-cover' />
          </div>
        </div>
        
        <Button size="xs" variant="outline">More info</Button>

      </div>
    </div>
  )
}

export default EnquiryGradingMessagingList