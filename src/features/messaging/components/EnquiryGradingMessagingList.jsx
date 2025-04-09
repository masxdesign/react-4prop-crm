import { useAuth } from '@/components/Auth/Auth'
import { cn } from '@/lib/utils'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { EnvelopeClosedIcon } from '@radix-ui/react-icons'
import { StarIcon } from 'lucide-react'
import PropertyCompany from './PropertyCompany'
import { Link } from '@tanstack/react-router'
import React from 'react'
import useBreakpoint from '@/hooks/use-TailwindBreakpoint'
import PropertyCompanySm from './PropertyCompanySm'

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

    const breakpoint = useBreakpoint()
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
          {isAgent && (
            <ClientContactInformation 
              enquired={enquired} 
              grade_updated={grade_updated}
            />
          )}
          <div className='flex flex-col md:flex-row gap-0'>
            <div className='flex md:flex-col md:items-stretch max-w-md mx-auto gap-4 md:gap-2 overflow-hidden p-2'>
              <div className='flex items-start gap-4'>
                {Grading && <Grading row={row} context={context} onGradeChange={onGradeChange} />}                
                <div className='bg-gray-200 size-28 overflow-hidden'>
                  <img src={thumbnail} className='object-cover w-full h-full' />
                </div>
              </div>
              {breakpoint === 'sm' ? (
                <div className='flex flex-col items-end gap-3 leading-tight'>
                  <PropertyTitle 
                    isAgent={isAgent} 
                    url_link_path={propertyTitleUrlLinkPath}
                    row={row} 
                  />   
                  {enquired?.company && (
                    <PropertyCompanySm
                      logo={enquired.company.logo.original}
                      name={enquired.company.name}
                    />
                  )}
                </div>  
              ) : (
                <div className='flex flex-col gap-3 flex-1'>
                  {renderLeftSide?.(row, index, context)}
                </div>
              )}
            </div>
            {breakpoint === 'sm' ? (
              <div className='flex flex-col gap-3 flex-1'>
                <div className='space-y-1'>
                  <div className='text-xs flex justify-center'>
                    <PropertySizeTenure 
                      color={statusColor}
                      status={statusText}
                      size={sizeText}
                      tenure={tenureText}
                    />
                  </div>
                  {content.description && (
                    <div className="opacity-60 text-xs max-w-[280px] mx-auto text-nowrap overflow-hidden truncate min-h-[20px]">
                      {content.description}
                    </div>  
                  )}
                </div>
                {renderLeftSide && (
                  <div className='flex flex-col items-center gap-2 px-2'>
                    {renderLeftSide(row, index, context)}
                  </div>
                )}
                <div className='p-1'>
                  {renderRightSide?.(row, index, context)}
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-3 sm:space-y-2 text-sm p-4 grow">
                <div className='flex gap-2'>
                  <div className='flex flex-col gap-2 grow max-w-[450px]'>
                    <PropertyTitle 
                      isAgent={isAgent} 
                      url_link_path={propertyTitleUrlLinkPath}
                      row={row} 
                    />
                    <PropertySizeTenure 
                      color={statusColor}
                      status={statusText}
                      size={sizeText}
                      tenure={tenureText}
                    />
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
            )}
          </div>                
        </div>
      )
    })
}

const PropertySizeTenure = ({ color, status, size, tenure }) => {
  return (
    <div className='flex gap-3'>
      <div className={cn("font-bold", { 
        "text-green-600": color === "green",
        "text-amber-600": color === "amber",
        "text-sky-600": color === "sky",
        "text-red-600": color === "red",
      })}>
        {status}
      </div>
      <div>{size}</div>
      <div>{tenure}</div>
    </div>
  )
}

const PropertyTitle = React.memo(({ isAgent, row, url_link_path = `/crm/view-details/$pid` }) => {
  let url_link = url_link_path.replace(/\$pid/, row.id)

  if (/^http(s):\/\//.test(url_link_path)) {
    return (
      <a 
        href={url_link} 
        target='_blank' 
        rel='noreferrer' 
        className='md:text-lg text-sm font-bold hover:underline leading-snug'
      >
        {row.title}
      </a>
    )
  }

  return (
    <Link 
      to={url_link} 
      search={(prev) => ({ ...prev, a: isAgent ? row.enquired.gradinguid: undefined })}
      className='md:text-lg text-sm font-bold hover:underline leading-snug'
    >
      {row.title}
    </Link>
  )
})

function ClientContactInformation({ enquired, grade_updated }) {
  return (
    <div className='flex flex-wrap items-center gap-1 sm:gap-4 text-xs border-b px-2 sm:px-4 py-2 sm:py-3 rounded-t-sm bg-gray-50'>
      {enquired.agent_to_agent ? (
        <>
          <div className='flex gap-2 items-center text-muted-foreground'>
            <EnvelopeClosedIcon className='size-3'/>
            <span>Enquiry</span>
          </div>
          <div className='px-2 text-muted-foreground ml-auto sm:ml-0'>{grade_updated}</div>
        </>
      ) : (
        <>
          {enquired.client.isGradeShare ? (
            <div className='flex gap-1 items-center text-muted-foreground'>
              <StarIcon className='size-3'/>
              <span>Grade share</span>
            </div>
          ) : (
            <div className='flex gap-2 items-center text-muted-foreground'>
              <EnvelopeClosedIcon className='size-3'/>
              <span>A client enquiried about this property</span>
            </div>
          )}
          <div className='px-2 text-muted-foreground ml-auto sm:ml-0'>{grade_updated}</div>
          <div className='sm:ml-auto flex gap-8 items-center'>

            <div className='flex gap-2 items-center'>
              <div className='font-bold'>{enquired.client.isGradeShare ? "Applicant": "Client"}</div>
              <div>{enquired.client.display_name}</div>
              <div className='bg-slate-50 size-5 rounded-full overflow-hidden flex justify-center items-center self-start'>
                <img src={`${FOURPROP_BASEURL}${enquired.client.avatar_sm}`} className='max-h-12 object-cover' />
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  )
}

export default EnquiryGradingMessagingList