import { createLazyFileRoute } from '@tanstack/react-router'
import EnquiriesPage, { useEnquiryList } from '../../-ui/enquiriesPage'
import { produce } from 'immer'
import { useAuth } from '@/components/Auth/Auth-context'

export const Route = createLazyFileRoute('/_auth/_com/user/$sub')({
    component: RouteComponent
})

function RouteComponent() {
    const { page, filters, isFiltersDirty, listQuery, pageTitle, pageDescription, queryClient } = Route.useRouteContext()

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

    const handleDealingAgentFirstMessage = (message, variables) => {
        queryClient.setQueryData(listQuery.queryKey, (prev) => {
            return produce(prev, (draft) => {
                const row = draft.results.find((row) => row.pid === variables.property.id)

                if (row) {
                    row.dealing_agents_chat_id = message.chat_id
                }  
            })
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
            <EnquiriesPage 
                page={page} 
                list={list}
                data={data}
                filters={filters} 
                refetch={refetch}
                isFetched={isFetched}
                isRefetching={isRefetching}
                isFiltersDirty={isFiltersDirty} 
                onFilterChange={handleFiltersChange}
                onDealingAgentFirstMessage={handleDealingAgentFirstMessage}
            /> 
        </div>
    )
}