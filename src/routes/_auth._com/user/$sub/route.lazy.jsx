import { createLazyFileRoute } from '@tanstack/react-router'
import EnquiriesPage, { useEnquiryList } from '../../-ui/enquiriesPage'

export const Route = createLazyFileRoute('/_auth/_com/user/$sub')({
    component: RouteComponent
})

function RouteComponent() {
    const { page, filters, isFiltersDirty, listQuery, pageTitle, pageDescription } = Route.useRouteContext()

    const navigate = Route.useNavigate()

    const enquiryListProps = useEnquiryList(listQuery)

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
                filters={filters} 
                enquiryListProps={enquiryListProps}
                isFiltersDirty={isFiltersDirty} 
                onFilterChange={handleFiltersChange}
            /> 
        </div>
    )
}