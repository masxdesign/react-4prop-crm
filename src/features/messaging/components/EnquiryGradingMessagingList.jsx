import { useAuth } from '@/components/Auth/Auth'
import { cn } from '@/lib/utils'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { EnvelopeClosedIcon } from '@radix-ui/react-icons'
import { StarIcon } from 'lucide-react'
import PropertyCompany from './PropertyCompany'

function EnquiryGradingMessagingList({ 
    list,
    renderLeftSide,
    renderRightSide,
    rowClassName,
    gradingComponent: Grading,
    context
}) {

    return list.map((row, index) => {
      const { id, title, enquired, statusColor, statusText, sizeText, tenureText, thumbnail, content, grade_updated } = row
      
      return (
        <div key={id} className={rowClassName}>
          {enquired.from_uid && (
            <SharingAgentContactInformation />
          )}
          {enquired.client && (
            <ClientContactInformation client={enquired.client} grade_updated={grade_updated} />
          )}
          <div className='flex gap-0'>
            <div className='flex flex-col gap-4 basis-1/5 overflow-hidden p-4'>
              <div className='flex items-start gap-4'>
                <div>
                  {Grading && <Grading row={row} context={context} />}
                </div>
                <div className='bg-gray-200 size-10 sm:size-28 rounded-lg overflow-hidden'>
                  <img src={thumbnail} className='object-cover w-full h-full' />
                </div>
              </div>
              {renderLeftSide?.(row, index, context)}
            </div>
            <div className="flex-1 space-y-3 sm:space-y-2 text-sm p-4">
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
                {enquired.company && (
                  <div className='basis-1/5 self-start flex flex-col gap-1'>
                    <PropertyCompany
                      logo={enquired.company.logo.original}
                      name={enquired.company.name}
                    />
                  </div>
                )}
              </div>
              {renderRightSide?.(row, index, context)}
            </div>
          </div>                
        </div>
      )
    })
}

function ClientContactInformation({ client, grade_updated }) {

  return (
    <div className='flex items-center gap-4 text-xs border-b px-4 py-3 shadow-sm rounded-md bg-gray-100'>
      {client.isGradeShare ? (
        <div className='flex gap-2 items-center text-muted-foreground'>
          <StarIcon className='size-3'/>
          <span>Grade share</span>
        </div>
      ) : (
        <div className='flex gap-2 items-center text-muted-foreground'>
          <EnvelopeClosedIcon className='size-3'/>
          <span>Enquiry</span>
        </div>
      )}
      <div>{grade_updated}</div>
      <div className='ml-auto flex gap-8 items-center'>

        <div className='flex gap-2 items-center'>
          <div className='font-bold'>{client.isGradeShare ? "Applicant": "Client"}</div>
          <div>{client.display_name}</div>
          <div className='bg-slate-50 size-5 rounded-full overflow-hidden flex justify-center items-center self-start'>
            <img src={`${FOURPROP_BASEURL}${client.avatar_sm}`} className='max-h-12 object-cover' />
          </div>
        </div>

      </div>
    </div>
  )
}

function SharingAgentContactInformation() {

  return (
    <div className='flex justify-center items-center gap-4 text-xs border-b px-4 py-3 shadow-sm rounded-md bg-gray-100'>
      Property shared by an agent
    </div>
  )
}

export default EnquiryGradingMessagingList