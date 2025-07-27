import EnquiriesPage, { useEnquiryList } from '@/routes/_auth._com/-ui/EnquiriesPage'
import { createLazyFileRoute } from '@tanstack/react-router'
import { produce } from 'immer'

export const Route = createLazyFileRoute('/_auth/_com/user/$sub')({
    component: RouteComponent
})

function RouteComponent() {
    const { auth, page, filters, isFiltersDirty, listQuery, pageTitle, pageDescription, queryClient, onGradeChange } = Route.useRouteContext()

    const navigate = Route.useNavigate()
    
    const { list, data, refetch, isFetched, isRefetching } = useEnquiryList(listQuery)

    const handleFiltersChange = (filterValues) => {
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

    const handleDealingAgentFirstMessage = (message) => {
        queryClient.setQueryData(listQuery.queryKey, (prev) => {
            return produce(prev, (draft) => {
                const item = draft.results.find((row) => row.pid === message._property.id)

                if (item) {
                    item.dealing_agents_chat_id = message.chat_id
                }  
            })
        })

    }
    
    return (
        <div className="space-y-6 sm:space-y-4 sm:pt-8">
            <div className='space-y-4'>
                {document.getElementById('menu_enquiries') && data.count > 0 && createPortal(
                    <span className='font-normal ml-2 text-xs'>{data.count}</span>, 
                    document.getElementById('menu_enquiries')
                )}
                <div className='space-y-1 px-3 sm:px-0'>
                    <h1 className='font-bold text-base sm:text-xl'>
                        {pageTitle}
                    </h1>
                    <p className='text-muted-foreground text-sm sm:text-base'>
                        {pageDescription}
                    </p>
                </div>
            </div>
            <EnquiriesPage 
                page={page} 
                bz_hash={auth.user.bz_hash}
                isAgent={auth.isAgent}
                list={list}
                data={data}
                filters={filters} 
                refetch={refetch}
                onGradeChange={onGradeChange}
                isFetched={isFetched}
                isRefetching={isRefetching}
                isFiltersDirty={isFiltersDirty} 
                onFilterChange={handleFiltersChange}
                onDealingAgentFirstMessage={handleDealingAgentFirstMessage}
            /> 
        </div>
    )
}