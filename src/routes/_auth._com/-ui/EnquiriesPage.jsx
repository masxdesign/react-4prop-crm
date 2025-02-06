import { Suspense, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileCheckIcon, HomeIcon, Loader2Icon, MessagesSquareIcon, XIcon } from 'lucide-react'
import { map } from 'lodash'
import PendingComponent from '@/components/PendingComponent'
import FilterEnquiryChoice from '@/features/enquiryChoice/FilterEnquiryChoice'
import FilterSearchRefEnquired from '@/features/searchReference/component/FilterSearchRefEnquired'
import { cn } from '@/lib/utils'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import { propReqContentsQuery, subtypesQuery, typesQuery } from '@/store/listing.queries'
import { detailsCombiner, propertyTypescombiner } from '@/store/use-listing'
import { EnvelopeClosedIcon, ReloadIcon } from '@radix-ui/react-icons'
import { useQuery, useSuspenseQueries } from '@tanstack/react-query'
import { createLazyFileRoute, Link, useNavigate, useRouteContext } from '@tanstack/react-router'
import companyCombiner from '@/services/companyCombiner'
import EnquiryGradingMessagingList from '@/features/messaging/components/EnquiryGradingMessagingList'
import { useAuth } from '@/components/Auth/Auth'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useInView } from 'react-intersection-observer'
import WriteYourReplyHereInput from './WriteYourReplyHereInput'
import { useMessagesLastNList } from './hooks'
import ChatboxBubbleBzStyle from '@/components/CRMTable/components/ChatboxBubbleBzStyle'
import { ChatboxSentdate } from '@/components/CRMTable/components'
import { messageCombiner } from '@/features/messaging/messaging.select'
import ReactMarkdown from '@/features/messaging/components/ReactMarkdown'
import { Attachment } from '@/components/Uppy/components'
import SearchReferenceSelect from '@/features/searchReference/component/SearchReferenceSelect'
import { useGradeUpdater } from '@/features/searchReference/searchReference.mutation'
import GradingWidget from '@/components/GradingWidget'
import { Button } from '@/components/ui/button'
import { useMap } from '@uidotdev/usehooks'
import WriteYourReplyHereInputForm from './WriteYourReplyHereInputForm'

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
      clients: propertiesData.clients,
      from_uids: propertiesData.from_uids,
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

export const useEnquiryList = (listQuery) => {
  const auth = useAuth()

  const { data } = useSuspenseQueries({
    queries: [
      typesQuery,
      subtypesQuery,
      listQuery
    ],
    combine: combineQueries
  })

  const contentsQuery = useQuery(propReqContentsQuery(data.pids, true))

  const list = useMemo(() => 
    detailsCombiner(
      data.types,
      data.properties,
      contentsQuery.data ?? [],
      data.companies,
      auth.isAgent ? data.clients: data.from_uids,
      defaultPropertyDetailsSetting,
      auth
    ), 
    [data.properties, contentsQuery.data, auth]
  )

  const { refetch, isFetched, isRefetching } = useQuery(listQuery)

  return {
    list,
    data,
    refetch, 
    isFetched, 
    isRefetching
  }
}

function EnquiriesPage({
  page, 
  isFiltersDirty, 
  list, 
  data, 
  refetch, 
  isFetched, 
  isRefetching,
  filters, 
  onFilterChange: handleFiltersChange
}) {
  
  useEffect(() => {

    if (isFetched) {
      window.scrollTo({ top: 0, behavior: "instant" })
    }

  }, [page, isFetched])

  const handleFilterSearchRefChange = (value) => {
    handleFiltersChange({
      searchRef: value
    })
  }

  const handleFilterChoiceChange = (value) => {
    handleFiltersChange({
      choice: value
    })
  }

  const activeKey = useMap(list.map((row) => ([row.id, 0])))
  
  return (
    <>
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
              const currActivekey = activeKey.get(row.id)
              const activeClassName = "border-green-500 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-500 font-bold"

              return (
                <>
                  <Suspense fallback={<Loader2Icon className="animate-spin" />}>
                    <SearchReferenceSelect 
                      tag_id={row.tag_id} 
                      pid={row.id} 
                      onClick={handleClick}
                    />
                  </Suspense>
                  {row.client?.isGradeShare && (
                    <div className='flex flex-col gap-1'>
                      {["Applicant", "Property agents"].map((label, index) => (
                        <Button 
                          key={index}
                          variant="outline" 
                          className={cn("text-xs", { [activeClassName]: currActivekey === index })}
                          onClick={() => {
                            activeKey.set(row.id, index)
                          }}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  )}
                  <Choices choices={row.enquiry_choices} className="flex-col gap-2" />
                </>
              )
            }}
            renderRightSide={(row) => {
              if (!row.chat_id) return null
              return activeKey.get(row.id) === 1 ? (
                <EnquiryMessagingWidget property={row} />
              ) : (
                <EnquiryMessagingWidget 
                  chat_id={row.chat_id} 
                  property={row}
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

    </>
  )
}

function EnquiryMessagingWidget({ chat_id, property }) {
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true })

  let child = null

  if (inView) {
    child = chat_id ? (
      <div className='flex flex-col gap-2 bg-cyan-400 rounded-xl'>
        <ViewAllMessagesLink chat_id={chat_id} />
        <div className='flex flex-col-reverse gap-4 px-3'>
          <LastMessagesList 
            chat_id={chat_id}
            isGradeShare={property.client?.isGradeShare}
          />
        </div>
        <div className='p-3'>
          <WriteYourReplyHereInput 
            chat_id={chat_id} 
            property={property} 
          />
        </div>
      </div>
    ) : (
      <div className='bg-cyan-400 px-4 py-4 text-center rounded-md space-y-4'>
        <div className='rounded-md bg-cyan-100 text-cyan-800 p-3 max-w-[400px] mx-auto shadow-sm'>
          There are no messages yet <br/>Start conversation with <b>property agents</b>
        </div>
        <WriteYourReplyHereInputForm placeholder="Write your message here..." />
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
  const auth = useAuth()
  const onGradeChange = useRouteContext({ select: (c) => c.onGradeChange })
  const gradeUpdater = useGradeUpdater(row.id)

  const handleSelect = async (grade) => {
    if (auth.isAgent) return
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

function LastMessagesList({ chat_id, isGradeShare }) {
  const auth = useAuth()
  const data = useMessagesLastNList(auth.bzUserId, chat_id)

  return data.map(row => {
    const isSender = row.from === auth.bzUserId
    
    return (
      <ChatboxBubbleBzStyle key={row.id} variant={isSender ? "sender": "recipient"} 
        className="relative min-w-64 shadow-sm">
        {isSender ? (
          <strong className='text-xs'>Message you sent</strong>
        ) : auth.isAgent ? (
          <strong className='text-xs'>Message from {isGradeShare ? "applicant": "client"}</strong>
        ) : (
          <strong className='text-xs'>Message from agent</strong>
        )}
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
        // from={Route.fullPath}
        search={(prev) => ({ ...prev, page: 1 })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": page < 2 })}
      >
        <span className='sr-only'>First page</span>
        <ChevronFirst strokeWidth={strokeWidth} className='size-4' />
      </Link>

      <Link
        // from={Route.fullPath}
        search={(prev) => ({ ...prev, page: Number(prev.page ?? 1) - 1 })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": page < 2 })}
      >
        <span className='sr-only'>Previous Page</span>
        <ChevronLeft strokeWidth={strokeWidth} className='size-4' />
      </Link>

      <span className='text-xs px-2'>page {page} of {pages}</span>
      
      <Link
        // from={Route.fullPath}
        search={(prev) => ({ ...prev, page: Number(prev.page ?? 1) + 1 })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": pages === page })}
      >
        <span className='sr-only'>Next Page</span>
        <ChevronRight strokeWidth={strokeWidth} className='size-4' />
      </Link>

      <Link
        // from={Route.fullPath}
        search={(prev) => ({ ...prev, page: pages })}
        className={cn("border p-1 rounded", { "pointer-events-none opacity-40": pages === page })}
      >
        <span className='sr-only'>Last page</span>
        <ChevronLast strokeWidth={strokeWidth} className='size-4' />
      </Link>
      
    </div>
  )
}

export default EnquiriesPage