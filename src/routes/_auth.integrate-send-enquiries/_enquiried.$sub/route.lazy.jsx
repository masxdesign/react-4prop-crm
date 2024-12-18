import { Suspense, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileCheckIcon, HomeIcon, Loader2Icon, MessagesSquareIcon, XIcon } from 'lucide-react'
import { map } from 'lodash'
import PendingComponent from '@/components/PendingComponent'
import FilterEnquiryChoice from '@/features/enquiryChoice/FilterEnquiryChoice'
import FilterSearchRefEnquired from '@/features/searchReference/component/FilterSearchRefEnquired'
import { cn } from '@/lib/utils'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { propReqContentsQuery, subtypesQuery, suitablePropertiesEnquiriedQuery, typesQuery } from '@/store/listing.queries'
import { detailsCombiner, propertyTypescombiner } from '@/store/use-listing'
import lowerKeyObject from '@/utils/lowerKeyObject'
import { EnvelopeClosedIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useQuery, useQueryClient, useSuspenseQueries } from '@tanstack/react-query'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import companyCombiner from '@/services/companyCombiner'
import EnquiryGradingMessagingList from '@/features/messaging/components/EnquiryGradingMessagingList'
import { useAuth } from '@/components/Auth/Auth-context'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useInView } from 'react-intersection-observer'
import WriteYourReplyHereInput from '../-ui/WriteYourReplyHereInput'
import { useMessagesLastNList } from '../-ui/hooks'
import ChatboxBubbleBzStyle from '@/components/CRMTable/components/ChatboxBubbleBzStyle'
import { ChatboxSentdate } from '@/components/CRMTable/components'
import { messageCombiner } from '@/features/messaging/messaging.select'
import ReactMarkdown from '@/features/messaging/components/ReactMarkdown'
import { Attachment } from '@/components/Uppy/components'
import SearchReferenceSelect from '@/features/searchReference/component/SearchReferenceSelect'
import { useGradeUpdater } from '@/features/searchReference/searchReference.mutation'
import GradingWidget from '@/components/GradingWidget'
import { produce } from 'immer'

export const Route = createLazyFileRoute('/_auth/integrate-send-enquiries/_enquiried/$sub')({
  component: RouteComponent,
  pendingComponent: PendingComponent
})

function combineQueries(result) {
  const [ { data: types }, { data: subtypes }, { data: propertiesData } ] = result

  if (!propertiesData) return null

  const pids = map(propertiesData.results, "pid")
  const companies = propertiesData.companies.map((row) => companyCombiner(row))

  return {
    data: {
      pids,
      companies,
      types: propertyTypescombiner(types, subtypes), 
      properties: propertiesData.results,
      pages: propertiesData.pagin.pages,
      need_reply: propertiesData.pagin.need_reply,
      count: propertiesData.pagin.count
    }
  }
}

const defaultPropertyDetailsSetting = {
  addressShowBuilding: true, 
  addressShowMore: true
}

function RouteComponent() {
  const { page, filters, isFiltersDirty, listQuery, pageTitle, pageDescription } = Route.useRouteContext()

  const navigate = Route.useNavigate()

  const { refetch, isFetched, isRefetching } = useQuery(listQuery)

  const { data } = useSuspenseQueries({
    queries: [
      typesQuery,
      subtypesQuery,
      listQuery
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
      data.companies,
      defaultPropertyDetailsSetting
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
  
  return (
    <div className="space-y-4 pt-8">

      {document.getElementById('menu_enquiries') && data.count > 0 && createPortal(
        <span className='font-normal ml-2 text-xs'>{data.count}</span>, 
        document.getElementById('menu_enquiries')
      )}

      <div className='space-y-2'>
        <h1 className='text-3xl space-x-2'>
          <span className='font-bold'>{pageTitle}</span>
        </h1>
        <p className='text-muted-foreground'>
          {pageDescription}
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
          <LinkClearFilters>
            <XIcon className='size-4' />
          </LinkClearFilters>
        )}
      </div>

      {data.pages > 0 ? (
        <>
          <div className="flex justify-between">

            <div className='flex gap-8'>
              <Pagination 
                page={page} 
                pages={data.pages}
              />
            </div>

            <div className='flex gap-2'>
              <div 
                className='py-1 px-2 flex gap-2 items-center border rounded text-sm shadow-sm text-muted-foreground'
              >
                <EnvelopeClosedIcon />
                <span className='text-slate-900 text-sm font-bold'>{data.count}</span>
              </div>             
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
            </div>
            
          </div>
          <EnquiryGradingMessagingList 
            list={list} 
            rowClassName="border rounded-lg"
            gradingComponent={Grading}
            renderLeftSide={(row) => {
              const handleClick = (selected) => {
                handleFilterSearchRefChange(selected ? selected.id: "NULL")
              }
              return (
                <>
                  <Suspense fallback={<Loader2Icon className="animate-spin" />}>
                    <SearchReferenceSelect 
                      tag_id={row.tag_id} 
                      pid={row.id} 
                      onClick={handleClick}
                    />
                  </Suspense>
                  <Choices choices={row.enquiry_choices} className="flex-col gap-2" />
                </>
              )
            }}
            renderRightSide={(row) => {
              if (!row.chat_id) return null
              return (
                  <EnquiryMessagingWidget 
                      property={row}
                      chat_id={row.chat_id} 
                      need_reply={row.need_reply} 
                  />
              )
            }}
          />
          <Pagination page={page} pages={data.pages} />
        </>
      ) : (
        <div className='min-h-[400px] flex flex-col items-center justify-center text-muted-foreground'>
          <h2 className='text-lg font-bold'>Currently no listing for this search</h2>
          <p>Make an another search or <LinkClearFilters className="text-slate-900 underline">clear selected filters</LinkClearFilters></p>
        </div>
      )}

    </div>
  )
}

function EnquiryMessagingWidget({ chat_id, property, need_reply }) {
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true })

  let child = null

  if (inView) {
    child = (
      <div className='flex flex-col gap-2 bg-cyan-400 rounded-xl'>
        <ViewAllMessagesLink chat_id={chat_id} />
        <div className='flex flex-col-reverse gap-4 px-3'>
          <LastMessagesList 
            chat_id={chat_id}
          />
        </div>
        <div className='p-3'>
          <WriteYourReplyHereInput chat_id={chat_id} property={property} />
        </div>
      </div>
    )
  }

  return (
      <div ref={inViewRef}>
         {child}
      </div>
  )
}

const Grading = ({ row }) => {
  const { onGradeChange } = Route.useRouteContext()
  const gradeUpdater = useGradeUpdater(row.id)

  const handleSelect = async (grade) => {
    await gradeUpdater.mutateAsync({ grade })
    onGradeChange(row.id, grade)
  }

  return (
      <GradingWidget 
          size={20}
          value={row.grade}
          onSelect={handleSelect}                                         
      />
  )
}

function LastMessagesList({ chat_id }) {
  const auth = useAuth()
  const data = useMessagesLastNList(chat_id)

  return data.map(row => {
    const isSender = row.from === auth.authUserId
    
    return (
      <ChatboxBubbleBzStyle key={row.id} variant={isSender ? "sender": "recipient"} 
        className="relative min-w-64 shadow-sm">
        <strong className='text-xs'>
          {isSender ? "Message you sent": "Message from agent"}
        </strong>
        <ChatboxBubbleBzMessage 
          type={row.type}
          body={!row.body ? '*no message*': row.body}
          from={row.from}
          chat_id={chat_id}
        />
        <Choices 
          choices={row.choices} 
          className={cn("mb-2", isSender ? "text-current-400": "text-slate-400")} 
        />
        <ChatboxSentdate sentdate={row.sent} />
      </ChatboxBubbleBzStyle>
    )
  })
}

const ChatboxBubbleBzMessage = ({ type, body, from, chat_id, className }) => {
  const message = messageCombiner(type, body, from, chat_id)

  return (
      <span className={cn("space-y-1", className)}>
          <ReactMarkdown content={message.teaser} />
          {message.attachments?.length > 0 && (
              message.attachments.map(({ name, url, fileType, fileSize }) => {
                  return (
                      <Attachment 
                          key={url}
                          name={name}
                          url={url}
                          fileType={fileType}
                          fileSize={fileSize}
                      />
                  )
              })
          )}
      </span>
  )
}

function Choices({ className, choices }) {

  if (choices === null || choices < 1) return null

  return (
    <ul className={cn('flex gap-4 text-xs', className)}>
      {(choices & 2) > 0 && (
        <li className='flex items-center gap-1'>
          <FileCheckIcon strokeWidth={2} className='size-3' />
          PDF sent
        </li>
      )}
      {(choices & 1) > 0 && (
        <li className='flex items-center gap-1'>
          <HomeIcon strokeWidth={2} className='size-3' />
          View requested
        </li>
      )}
    </ul>
  )
}

function ViewAllMessagesLink({ chat_id }) {
  const conversation_url = `${FOURPROP_BASEURL}/bizchat/rooms/${chat_id}`

  return (
    <Dialog>
      <DialogTrigger asChild>        
        <button
          className='flex gap-2 items-center justify-center font-normal px-2 py-4'
        >
          <MessagesSquareIcon className='size-4 text-cyan-100' />
          <span className='text-sm hover:underline text-white'>open messages</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] h-[800px] p-0 border-none [&>button>svg]:size-8 [&>button]:text-white [&>button]:-top-10 [&>button]:-right-0">
        <iframe src={conversation_url} className='h-full w-full rounded-lg'></iframe>
      </DialogContent>
    </Dialog>
  )
}

function LinkClearFilters(props) {
  return (
    <Link 
      to="." 
      search={{
        page: 1,
        filters: undefined
      }}
      {...props}
    />
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

      <span className='text-xs px-2'>page {page} of {pages}</span>
      
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