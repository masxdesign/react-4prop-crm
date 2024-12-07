import { useAuth } from '@/components/Auth/Auth-context'
import { ChatboxSentdate } from '@/components/CRMTable/components'
import ChatboxBubbleBzStyle from '@/components/CRMTable/components/ChatboxBubbleBzStyle'
import GradingWidget from '@/components/GradingWidget'
import PendingComponent from '@/components/PendingComponent'
import FilterEnquiryChoice from '@/features/enquiryChoice/FilterEnquiryChoice'
import ReactMarkdown from '@/features/messaging/components/ReactMarkdown'
import { bizchatMessagesLastNQuery } from '@/features/messaging/messaging.queries'
import FilterSearchRefEnquired from '@/features/searchReference/component/FilterSearchRefEnquired'
import { cn } from '@/lib/utils'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { propReqContentsQuery, subtypesQuery, suitablePropertiesEnquiriedQuery, typesQuery } from '@/store/listing.queries'
import { detailsCombiner, propertyTypescombiner } from '@/store/use-listing'
import lowerKeyObject from '@/utils/lowerKeyObject'
import { OpenInNewWindowIcon, ReloadIcon } from '@radix-ui/react-icons'
import { Slot } from '@radix-ui/react-slot'
import { useQuery, useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { createLazyFileRoute, Link, retainSearchParams } from '@tanstack/react-router'
import { filter, keyBy, map, omit } from 'lodash'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, DownloadCloud, DownloadIcon, EyeIcon, FileIcon, HomeIcon, XIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useInView } from 'react-intersection-observer'

export const Route = createLazyFileRoute('/_auth/integrate-send-enquiries/enquiries')({
  component: RouteComponent,
  pendingComponent: PendingComponent
})

function combineQueries(result) {
  const [ { data: types }, { data: subtypes }, { data: propertiesData } ] = result

  if (!propertiesData) return null

  const properties = propertiesData.results.map(row => lowerKeyObject(row))
  const companies = keyBy(propertiesData.companies, "c")
  const pids = map(properties, "pid")

  return {
    data: {
      types: propertyTypescombiner(types, subtypes), 
      properties,
      companies,
      pids,
      pages: propertiesData.pagin.pages,
      need_reply: propertiesData.pagin.need_reply,
      count: propertiesData.pagin.count
    }
  }
}

function RouteComponent() {
  const { page, filters, perpage, isFiltersDirty } = Route.useRouteContext()

  const navigate = Route.useNavigate()

  const { refetch, isFetched, isRefetching } = useQuery(suitablePropertiesEnquiriedQuery({ page, perpage, filters }))

  const { data } = useSuspenseQueries({
    queries: [
      typesQuery,
      subtypesQuery,
      suitablePropertiesEnquiriedQuery({ page, perpage, filters })
    ],
    combine: combineQueries,
  })

  useEffect(() => {

    if (isFetched) {
      window.scrollTo({ top: 0, behavior: "instant" })
    }

  }, [page, isFetched])

  const contentsQuery = useQuery(propReqContentsQuery(data.pids, true))

  const list = useMemo(() => 
    detailsCombiner(
      data.types,
      data.properties,
      contentsQuery.data ?? [],
      data.companies
    ), 
    [data.properties, contentsQuery.data]
  )

  const handleFilters = (filterValues) => {
    navigate({
      to: ".",
      search: (prev) => ({ 
        ...prev, 
        page: 1,
        filters: {
          ...prev.filters,
          ...filterValues
        }
      })
    })
  }

  const handleFilterSearchRefChange = (value) => {
    handleFilters({
      searchRef: value
    })
  }

  const handleFilterChoiceChange = (value) => {
    handleFilters({
      choice: value
    })
  }

  const X = (
    <span 
        style={{ backgroundImage: `url(${FOURPROP_BASEURL}/svg/close/10/999)` }}
        className="bg-no-repeat size-5 cursor-pointer bg-cover inline-block align-middle translate-y-[-1px]"
    />
  )
  
  return (
    <div className="space-y-4 pt-8">

      {document.getElementById('menu_enquiries') && data.count > 0 && createPortal(
        <span className='font-normal ml-2 text-xs'>{data.count}</span>, 
        document.getElementById('menu_enquiries')
      )}

      <div className='space-y-2'>
        <h1 className='text-3xl font-bold'>
          Enquiries
        </h1>
        <p className='text-muted-foreground'>
          Your current active enquiries. View and reply to messages sent back from the agent. By selecting the {X} enquiries are placed in the inactive listing
        </p>
      </div>

      <div className='flex items-center gap-4'>
        <div className='flex gap-2 items-center'>
          <h2 className='text-xs text-slate-500'>Search ref</h2>
          <FilterSearchRefEnquired 
            value={filters.searchRef} 
            onValueChange={handleFilterSearchRefChange} 
          />
        </div>
        <div className='flex gap-2 items-center'>
          <h2 className='text-xs text-slate-500'>Choice</h2>
          <FilterEnquiryChoice  
           value={filters.choice}
           onValueChange={handleFilterChoiceChange}
          />
        </div>
        {isFiltersDirty && (
          <Link 
            to="." 
            search={{
              page: 1,
              filters: undefined
            }}
          >
            <XIcon className='size-4' />
          </Link>
        )}
      </div>

      <div className="flex justify-between">

        <div className='flex gap-8'>
          <Pagination 
            page={page} 
            pages={data.pages} 
            className=""
          />
        </div>

        <div className='flex gap-2'>
          {isFetched && (
            <Link 
              to="."
              key="dd"
              search={{ page: 1 }}
              onClick={() => {
                refetch()
              }}
              className='py-1 px-2 flex gap-2 items-center border rounded text-sm shadow-sm text-muted-foreground'
            >
              <span>{isRefetching ? "refetching...": "Refresh"}</span>
              <ReloadIcon />
            </Link>
          )}
          {data.need_reply > 0 ? (
            <div 
              className='py-1 px-2 flex gap-2 items-center border rounded text-sm shadow-sm text-muted-foreground'
            >
              <span>Replies</span>
              <span className='flex items-center justify-center bg-red-500 rounded-sm size-4 text-white text-xs'>
                {data.need_reply}
              </span>
            </div>
          ) : (
            <div 
              className='py-1 px-2 flex gap-1 items-center border rounded text-sm shadow-sm text-muted-foreground'
            >
              <span>No replies</span>
            </div>
          )}
        </div>
        
      </div>

      {list.map((row) => (
        <Enquiry key={row.id} data={row} />
      ))}

      <Pagination page={page} pages={data.pages} />

    </div>
  )
}

function Enquiry({ data }) {
  const { ref: inViewRef, inView } = useInView()

  const { id, title, grade, statusColor, statusText, sizeText, tenureText, thumbnail, content, chat_id, need_reply, tag_name, enquiry_choices } = data

  return (
    <div ref={inViewRef} className="space-y-0 p-4 border rounded-lg">
      <div className='flex gap-4'>
        <div>
          <GradingWidget 
              size={20}
              value={grade}                                         
          />
        </div>
        <img src={thumbnail} className="object-contain size-10 sm:size-28 bg-gray-200" />
        <div className="space-y-3 sm:space-y-2 text-sm flex-grow">
          <a 
            href={`${FOURPROP_BASEURL}/view-details/${id}`} 
            target="_blank" 
            className='font-bold hover:underline'
          >
            {title}
            <OpenInNewWindowIcon className='inline ml-1 opacity-50' />
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
          <div className="flex items-center gap-4">
            <div className='inline-block border border-slate-200 text-slate-500 text-xs rounded px-2 py-1'>
              {tag_name ? tag_name: "Unnamed"}
            </div>
            <Choices choices={enquiry_choices} />
          </div>
          {chat_id && inView && (
            <>
              <LastMessages 
                chat_id={chat_id} 
                need_reply={need_reply} 
                limit={1}
              />
              <div className='flex justify-center'>
                <Slot href={`${FOURPROP_BASEURL}/bizchat/rooms/${chat_id}`} target="__blank">
                  {need_reply ? (
                    <a className='px-6 py-3 bg-amber-500 text-white rounded-lg'>
                      reply message
                    </a>
                  ) : (
                    <a className='px-6 py-3 text-sky-700 hover:underline'>
                      open messages
                    </a>
                  )}
                </Slot>
              </div>
            </>
          )}
        </div>
      </div>                
    </div>
  )
}

function Pagination({ page, pages, className, strokeWidth = 2 }) {
  
  return (
    <div className={cn('flex gap-1 items-center text-sm text-slate-500', className)}>

      <Link
        from={Route.fullPath}
        search={(prev) => ({ ...prev, page: 1 })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": page < 2 })}
      >
        <span className='sr-only'>First page</span>
        <ChevronFirst strokeWidth={strokeWidth} className='size-4' />
      </Link>

      <Link
        from={Route.fullPath}
        search={(prev) => ({ ...prev, page: Number(prev.page ?? 1) - 1 })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": page < 2 })}
      >
        <span className='sr-only'>Previous Page</span>
        <ChevronLeft strokeWidth={strokeWidth} className='size-4' />
      </Link>

      <span className='text-xs px-2'>{page} of {pages}</span>
      
      <Link
        from={Route.fullPath}
        search={(prev) => ({ ...prev, page: Number(prev.page ?? 1) + 1 })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": pages === page })}
      >
        <span className='sr-only'>Next Page</span>
        <ChevronRight strokeWidth={strokeWidth} className='size-4' />
      </Link>

      <Link
        from={Route.fullPath}
        search={(prev) => ({ ...prev, page: pages })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": pages === page })}
      >
        <span className='sr-only'>Last page</span>
        <ChevronLast strokeWidth={strokeWidth} className='size-4' />
      </Link>
      
    </div>
  )
}

function LastMessages({ chat_id, limit }) {
  const auth = useAuth()
  const { data } = useSuspenseQuery(bizchatMessagesLastNQuery(auth.authUserId, chat_id, limit)) 

  return (
    <div className='flex flex-col-reverse gap-4 bg-cyan-400 rounded-xl px-3 pt-4 pb-5'>
      {data.map(row => {
        const isSender = row.from === auth.authUserId
        
        return (
          <ChatboxBubbleBzStyle key={row.id} variant={isSender ? "sender": "recipient"} 
            className="relative min-w-64 shadow-sm">
            <strong className='text-xs'>
              {isSender ? "Message you sent": "Message from agent"}
            </strong>
            <ReactMarkdown  
              content={!row.body ? '*no message*': row.body} 
            />
            <Choices 
              choices={row.choices} 
              className={cn("mb-2", isSender ? "text-current-400": "text-slate-400")} 
            />
            <ChatboxSentdate sentdate={row.sent} />
          </ChatboxBubbleBzStyle>
        )
      })}
    </div>
  )
}

function Choices({ className, choices }) {

  if (choices === null || choices < 1) return null

  return (
    <ul className={cn('flex gap-4 text-xs', className)}>
      {(choices & 2) > 0 && (
        <li className='flex items-center gap-1'>
          <DownloadIcon strokeWidth={2} className='size-3' />
          PDF
        </li>
      )}
      {(choices & 1) > 0 && (
        <li className='flex items-center gap-1'>
          <HomeIcon strokeWidth={2} className='size-3' />
          View
        </li>
      )}
    </ul>
  )
}