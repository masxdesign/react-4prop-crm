import { useAuth } from '@/components/Auth/Auth'
import { cn } from '@/lib/utils'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { EnvelopeClosedIcon } from '@radix-ui/react-icons'
import { StarIcon } from 'lucide-react'
import PropertyCompany from './PropertyCompany'
import { Link } from '@tanstack/react-router'
import React from 'react'

function EnquiryGradingMessagingList({ 
    list,
    isAgent,
    renderLeftSide,
    renderRightSide,
    renderStatus,
    rowClassName,
    onGradeChange,
    gradingComponent: Grading,
    propertyTitleUrlLinkPath,
    context
}) {

    // todo: my enquiry on 4prop

    return list.map((row, index) => {
      const { key, id, title, enquired, statusColor, statusText, sizeText, tenureText, thumbnail, content, grade_updated } = row

      return (
        <div key={key} className={cn("relative", rowClassName)}>
          {enquired?.from_uid && (
            <div className='flex justify-center items-center gap-4 text-xs border-b px-4 py-3 shadow-sm rounded-md bg-gray-100'>
              Property sent to me by the agent
            </div>
          )}
          <ClientContactInformation 
            enquired={enquired} 
            grade_updated={grade_updated} 
            isAgent={isAgent}
          />
          <div className='flex gap-0'>
            <div className='flex flex-col gap-2 overflow-hidden p-4'>
              <div className='flex items-start gap-4'>
                <div>
                  {Grading && <Grading row={row} context={context} onGradeChange={onGradeChange} />}
                </div>
                <div className='bg-gray-200 size-10 sm:size-28 overflow-hidden'>
                  <img src={thumbnail} className='object-cover w-full h-full' />
                </div>
              </div>
              {renderLeftSide?.(row, index, context)}
            </div>
            <div className="flex-1 space-y-3 sm:space-y-2 text-sm p-4 grow">
              <div className='flex gap-2'>
                <div className='flex flex-col gap-2 grow max-w-[450px]'>
                  <PropertyTitle 
                    isAgent={isAgent} 
                    url_link_path={propertyTitleUrlLinkPath}
                    row={row} 
                  />
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
                  <div className="opacity-60 text-nowrap overflow-hidden truncate min-h-[20px]">
                    {content.description}
                  </div>            
                </div>
                <div className='flex items-end flex-col ml-auto'>
                  {renderStatus && (
                    <div>
                      {renderStatus(row, index, context)}
                    </div>
                  )}
                  {enquired?.company && (
                    <div className='flex flex-col items-center px-2'>
                      <PropertyCompany
                        logo={enquired.company.logo.original}
                        name={enquired.company.name}
                      />
                    </div>
                  )}
                </div>
              </div>
              {renderRightSide?.(row, index, context)}
            </div>
          </div>                
        </div>
      )
    })
}

const PropertyTitle = React.memo(({ isAgent, row, url_link_path = `/crm/view-details/$pid` }) => {
  const url_link = url_link_path.replace(/\$pid/, row.id)

  if (/^http(s):\/\//.test(url_link_path)) {
    return (
      <a 
        href={url_link} 
        target='_blank' 
        rel='noreferrer' 
        className='text-lg font-bold hover:underline leading-snug'
      >
        {row.title}
      </a>
    )
  }

  return (
    <Link 
      to={url_link_path.replace(/\$pid/, row.id)} 
      search={{ a: isAgent ? row.enquired.gradinguid: undefined }}
      className='text-lg font-bold hover:underline leading-snug'
    >
      {row.title}
    </Link>
  )
})

function ClientContactInformation({ isAgent, enquired, grade_updated }) {

  if (!isAgent) return  null

  return enquired.agent_to_agent ? (
    <div className='flex items-center gap-4 text-xs border-b px-4 py-3 rounded-t-sm bg-gray-50'>
      <div className='flex gap-2 items-center text-muted-foreground'>
        <EnvelopeClosedIcon className='size-3'/>
        <span>You enquiried about this property</span>
      </div>
      <div>{grade_updated}</div>
    </div>
  ) : (
    <div className='flex items-center gap-4 text-xs border-b px-4 py-3 rounded-t-sm bg-gray-50'>
      {enquired.client.isGradeShare ? (
        <div className='flex gap-2 items-center text-muted-foreground'>
          <StarIcon className='size-3'/>
          <span>You shared this property to an applicant</span>
        </div>
      ) : (
        <div className='flex gap-2 items-center text-muted-foreground'>
          <EnvelopeClosedIcon className='size-3'/>
          <span>A client enquiried about this property</span>
        </div>
      )}
      <div>{grade_updated}</div>
      <div className='ml-auto flex gap-8 items-center'>

        <div className='flex gap-2 items-center'>
          <div className='font-bold'>{enquired.client.isGradeShare ? "Applicant": "Client"}</div>
          <div>{enquired.client.display_name}</div>
          <div className='bg-slate-50 size-5 rounded-full overflow-hidden flex justify-center items-center self-start'>
            <img src={`${FOURPROP_BASEURL}${enquired.client.avatar_sm}`} className='max-h-12 object-cover' />
          </div>
        </div>

      </div>
    </div>
  )
}

export default EnquiryGradingMessagingList