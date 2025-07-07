import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, FileCheckIcon, HomeIcon, Loader2, Loader2Icon, MessagesSquareIcon, XIcon } from 'lucide-react'
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
import { authCombiner, useAuth } from '@/components/Auth/Auth'
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
import WriteYourMessageHereInput from './WriteYourMessageHereInput'
import Grading from '@/features/messaging/components/Grading'
import Choices from '@/features/messaging/components/Choices'

function combineQueries(result, pauth) {
  const [ { data: dtypes }, { data: dsubtypes }, { data: pdata } ] = result

  if (!pdata) return null

  const properties = pdata.results
  const pids = map(properties, "pid")
  const companies = pdata.companies.map((row) => companyCombiner(row))
  const types = propertyTypescombiner(dtypes, dsubtypes)
  const auth = pdata.i ? authCombiner(pdata.i): pauth

  return {
    data: {
      pids,
      companies,
      types,
      auth,
      properties: pdata.results,
      pages: pdata.pagin.pages,
      need_reply: pdata.pagin.need_reply,
      count: pdata.pagin.count,
      fetchPropReqContentsQuery: propReqContentsQuery(pids, true),
      propertyDetailsCombiner: (contentsData = []) => {

        const clientsFromUids = auth.isAgent ? pdata.clients: pdata.from_uids

        return detailsCombiner(
          types,
          properties,
          contentsData,
          companies,
          clientsFromUids,
          defaultPropertyDetailsSetting,
          auth
        )

      }
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
    combine: useCallback((result) => combineQueries(result, auth), [auth])
  })

  const contentsQuery = useQuery(data.fetchPropReqContentsQuery)

  const list = useMemo(
    () => data.propertyDetailsCombiner(contentsQuery.data), 
    [data, contentsQuery]
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
  bz_hash,
  isAgent,
  data, 
  refetch, 
  isFetched, 
  isRefetching,
  filters, 
  onGradeChange,
  onFilterChange: handleFiltersChange,
  onDealingAgentFirstMessage: handleDealingAgentFirstMessage
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

  const activeKey = useMap(list.map((row) => ([row.key, 0])))
  
  return (
    <div className='space-y-8 sm:space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-2 sm:px-0'>
        <div className='flex gap-2 items-center'>
          <h2 className='text-xs text-slate-500 w-[6em]'>Search ref</h2>
          <FilterSearchRefEnquired 
            value={filters.searchRef} 
            onValueChange={handleFilterSearchRefChange} 
          />
        </div>
        <div className='flex gap-2 items-center'>
          <h2 className='text-xs text-slate-500 w-[6em] sm:w-auto'>Choice</h2>
          <FilterEnquiryChoice  
           value={filters.choice}
           onValueChange={handleFilterChoiceChange}
          />
        </div>
        {isFiltersDirty && (
          <LinkClearFilters className="py-2 px-3 sm:p-0 flex self-start sm:self-auto items-center gap-2 bg-slate-100 rounded-sm sm:bg-transparent">
            <XIcon className='size-4' />
            <span className='text-xs sm:hidden'>Clear filters</span>
          </LinkClearFilters>
        )}
      </div>

      <div className='space-y-4'>
        {data.pages > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-between">
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
            <div className='space-y-8'>
              <EnquiryGradingMessagingList 
                list={list} 
                isAgent={isAgent}
                rowClassName="border-2 rounded-xl overflow-hidden shadow-xl md:shadow-none"
                onGradeChange={onGradeChange}
                gradingComponent={Grading}
                renderLeftSide={(row) => {
                  const handleClick = (selected) => {
                    handleFilterSearchRefChange(selected ? selected.id: "NULL")
                  }
                  const currActivekey = activeKey.get(row.key)
                  const activeClassName = "border-green-500 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-500 font-bold"

                  return (
                    <>
                      <Suspense fallback={<Loader2Icon className="animate-spin" />}>
                        <SearchReferenceSelect 
                          tag_id={row.tag_id} 
                          pid={row.id} 
                          onClick={handleClick}
                          isAgent={data.auth.isAgent}
                        />
                      </Suspense>
                      <Choices choices={row.enquiry_choices} className="md:flex-col gap-4 md:gap-2" />
                      {row.enquired.client?.isGradeShare && (
                        <div className='flex md:flex-col gap-1'>
                          {["Applicant", "Property agents"].map((label, index) => (
                            <Button 
                              key={index}
                              variant="outline" 
                              className={cn("text-xs", { [activeClassName]: currActivekey === index })}
                              onClick={() => {
                                activeKey.set(row.key, index)
                              }}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  )
                }}
                renderRightSide={(row) => {
                  if (!row.chat_id) return null

                  return activeKey.get(row.key) === 1 ? (
                    <EnquiryMessagingWidgetInView 
                      key={1}
                      bz_hash={bz_hash}
                      property={row}
                      chat_id={row.original.dealing_agents_chat_id}
                      onDealingAgentFirstMessage={handleDealingAgentFirstMessage}
                      recipientLabel="property agent"
                    />
                  ) : (
                    <EnquiryMessagingWidgetInView 
                      key={2}
                      bz_hash={bz_hash}
                      property={row}
                      chat_id={row.chat_id} 
                      recipientLabel={
                        row.isGradeShare 
                          ? "applicant"
                          : "client"
                      }
                    />
                  )
                }}
              />
            </div>
            <Pagination page={page} pages={data.pages} />
          </>
        ) : (
          <div className='min-h-[400px] flex flex-col items-center justify-center text-muted-foreground'>
            <h2 className='text-lg font-bold'>Currently no listing for this search</h2>
            <p>Make an another search or <LinkClearFilters className="text-slate-900 underline">clear selected filters</LinkClearFilters></p>
          </div>
        )}
      </div>

    </div>
  )
}

function EnquiryMessagingWidget({ ownerNid, className, bz_hash, chat_id, property, recipientLabel, onDealingAgentFirstMessage }) {
  return chat_id ? (
    <div className={cn('flex flex-col gap-2 bg-cyan-400 rounded-lg', className)}>
      <ViewAllMessagesLink chat_id={chat_id} bz_hash={bz_hash} />
      <div className='flex flex-col-reverse gap-4 px-3'>
        <LastMessagesList 
          ownerNid={ownerNid}
          chat_id={chat_id}
          recipientLabel={recipientLabel}
        />
      </div>
      <div className='p-1 sm:p-3'>
        <WriteYourReplyHereInput 
          chat_id={chat_id} 
          property={property} 
        />
      </div>
    </div>
  ) : (
    <div className={cn('bg-cyan-400 px-4 py-4 text-center rounded-md space-y-4', className)}>
      <div className='rounded-md bg-cyan-100 text-cyan-800 p-3 max-w-[400px] mx-auto shadow-sm'>
        There are no messages yet <br/>Start conversation with <b>property agents</b>
      </div>
      <WriteYourMessageHereInput 
        property={property} 
        onSuccess={onDealingAgentFirstMessage}
      />
    </div>
  )
}

export function EnquiryMessagingWidgetInView({ ownerNid, bz_hash, chat_id, property, recipientLabel, onDealingAgentFirstMessage, className, widgetClassName }) {
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true })

  let child = null

  if (inView) {
    child = (
      <EnquiryMessagingWidget 
        bz_hash={bz_hash}
        ownerNid={ownerNid}
        chat_id={chat_id} 
        property={property} 
        recipientLabel={recipientLabel} 
        onDealingAgentFirstMessage={onDealingAgentFirstMessage}
        className={widgetClassName}
      />
    ) 
  }

  return (
      <div ref={inViewRef} className={className}>
        <Suspense fallback={<Loader2 className="animate-spin" />}>
          {child}
        </Suspense>
      </div>
  )
}

function LastMessagesList({ chat_id, ownerNid, recipientLabel }) {
  const auth = useAuth()

  const bzUserId = ownerNid ?? auth.bzUserId

  const data = useMessagesLastNList(bzUserId, chat_id)

  return data.map(row => {
    const isSender = row.from === bzUserId
    
    return (
      <ChatboxBubbleBzStyle key={row.id} variant={isSender ? "sender": "recipient"} 
        className="relative min-w-64 shadow-sm">
        {isSender ? (
          <strong className='text-xs'>Message you sent</strong>
        ) : auth.isAgent ? (
          <strong className='text-xs'>Message from {recipientLabel}</strong>
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

function ViewAllMessagesLink({ chat_id, bz_hash }) {
  const conversation_url = `${FOURPROP_BASEURL}/bizchat/rooms/${chat_id}?hide_top_bar=1&i=${bz_hash}`

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
      <DialogContent className="sm:max-w-[800px] max-w-[98%] md:h-[800px] h-[calc(100svh-100px)] p-0 border-none [&>button>svg]:size-8 [&>button]:text-white [&>button]:-top-10 [&>button]:-right-0 rounded-lg">
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