import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/components/Auth/Auth'
import { useMemo, useCallback, Suspense, useState, useEffect } from 'react'
import { fetchAgentPropertiesCursor } from '@/components/Magazine/api'
import VirtualizedExpandableTable from '@/components/ui-custom/VirtualizedExpandableTable'
import LazyPropertyDetails from '@/components/Magazine/AgentPropertiesTable/LazyPropertyDetails'
import { enhancedPropertyCombiner, propertyUtils } from '@/hooks/propertyDetails-hooks'
import { propertyTypescombiner } from '@/store/use-listing'
import { typesQuery, subtypesQuery } from '@/store/listing.queries'
import { Building, RefreshCw, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query'

export const Route = createFileRoute('/_auth/_dashboard/properties/')({
  component: PropertiesPage,
})

function PropertiesPage() {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const agentId = auth.user?.neg_id

  // Prevent advertisers from accessing
  if (auth?.isAdvertiser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Advertisers cannot access this page.</p>
        </div>
      </div>
    )
  }

  if (!agentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Agent ID</h2>
          <p className="text-gray-600">Agent ID is required.</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      }
    >
      <PropertiesTableContent agentId={agentId} queryClient={queryClient} />
    </Suspense>
  )
}

function PropertiesTableContent({ agentId, queryClient }) {
  const [total, setTotal] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState(null)
  const [sortOrder, setSortOrder] = useState(null)

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  // Include debouncedSearch and sort in queryKey so query refetches when they change
  const queryKey = useMemo(
    () => ['agent-properties-infinite', agentId, debouncedSearch, sortBy, sortOrder],
    [agentId, debouncedSearch, sortBy, sortOrder]
  )

  const handleSortChange = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }, [])

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const handleTotalChange = useCallback((newTotal) => {
    setTotal(newTotal)
  }, [])

  // Column definitions
  const columns = useMemo(
    () => [
      {
        key: 'area',
        header: 'Area',
        width: '70px',
        sortKey: 'area',
        render: (item) => (
          <span className="text-muted-foreground">
            {item.original?.matchpostcode || '-'}
          </span>
        ),
      },
      {
        key: 'address',
        header: 'Address',
        flex: 2,
        minWidth: '200px',
        render: (item) => (
          <div className="flex items-center gap-2 max-w-xs">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt="Property"
                className="w-8 h-8 rounded object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-200 shrink-0 flex items-center justify-center">
                <Building className="w-4 h-4 text-gray-400" />
              </div>
            )}
            <div className="truncate" title={item.addressText}>
              {item.addressText || 'Address unavailable'}
            </div>
          </div>
        ),
      },
      {
        key: 'subtypes',
        header: 'Subtypes',
        flex: 3,
        minWidth: '120px',
        render: (item) => (
          <div className="truncate" title={item.subtypesText}>
            {item.subtypesText || 'No subtypes'}
          </div>
        ),
      },
      {
        key: 'size',
        header: 'Size',
        flex: 1.5,
        minWidth: '100px',
        sortKey: 'size',
        render: (item) => {
          const parts = [item.sizeText, item.landText].filter(Boolean)
          const sizeDisplay = parts.join(' / ') || '-'
          return (
            <span className="text-muted-foreground" title={sizeDisplay}>
              {sizeDisplay}
            </span>
          )
        },
      },
      {
        key: 'tenure',
        header: 'Price/Rent',
        flex: 1.5,
        minWidth: '120px',
        sortKey: 'tenure',
        render: (item) => (
          <span className="font-medium text-green-600">{item.tenureText || 'N/A'}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        flex: 1,
        minWidth: '120px',
        render: (item) => {
          const color = item.statusColor || 'gray'
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
            >
              {item.statusText || 'Unknown'}
            </span>
          )
        },
      },
      {
        key: 'schedules_total',
        header: 'Total',
        width: '70px',
        align: 'center',
        sortKey: 'total',
        render: (item) => (
          <span className="bg-slate-100 text-muted-foreground px-2 py-1 rounded-full text-xs font-medium">
            {item.original?.schedules_total || 0}
          </span>
        ),
      },
      {
        key: 'schedules_to_approve',
        header: 'Approve',
        width: '70px',
        align: 'center',
        sortKey: 'approve',
        render: (item) => (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
            {item.original?.schedules_to_approve || 0}
          </span>
        ),
      },
      {
        key: 'schedules_to_pay',
        header: 'Pay',
        width: '70px',
        align: 'center',
        sortKey: 'pay',
        render: (item) => (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {item.original?.schedules_to_pay || 0}
          </span>
        ),
      },
    ],
    []
  )

  // Query function for infinite scroll (includes search and sort params for backend)
  const queryFn = useCallback(
    ({ cursor, pageSize }) => fetchAgentPropertiesCursor(agentId, { cursor, pageSize, search: debouncedSearch, sortBy, sortOrder }),
    [agentId, debouncedSearch, sortBy, sortOrder]
  )

  // Render expanded content with lazy loading
  const renderExpandedContent = useCallback(
    (item) => <LazyPropertyDetails property={item} agentId={agentId} />,
    [agentId]
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          <h1 className="text-xl font-bold">
            My Department Properties
            {total !== null && (
              <span className="ml-2 text-muted-foreground font-normal">({total})</span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter by address or subtype..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-9 pr-8 w-64"
            />
            {inputValue && (
              <button
                onClick={() => setInputValue('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table with transformation wrapper */}
      <PropertiesTableWithTransform
        queryKey={queryKey}
        queryFn={queryFn}
        columns={columns}
        renderExpandedContent={renderExpandedContent}
        agentId={agentId}
        onTotalChange={handleTotalChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
    </div>
  )
}

/** Wrapper component that handles property transformation */
function PropertiesTableWithTransform({
  queryKey,
  queryFn,
  columns,
  renderExpandedContent,
  agentId,
  onTotalChange,
  sortBy,
  sortOrder,
  onSortChange,
}) {
  // Fetch types and subtypes for property transformation
  const [typesResult, subtypesResult] = useSuspenseQueries({
    queries: [typesQuery, subtypesQuery],
  })

  const propertyTypes = useMemo(
    () => propertyTypescombiner(typesResult.data, subtypesResult.data),
    [typesResult.data, subtypesResult.data]
  )

  // Transform raw property to enhanced property
  const transformProperty = useCallback(
    (rawProperty) => {
      const normalized = propertyUtils.normalizePropertyData(rawProperty)
      return enhancedPropertyCombiner(normalized, propertyTypes, [], [])
    },
    [propertyTypes]
  )

  // Wrap queryFn to transform results
  const transformedQueryFn = useCallback(
    async (params) => {
      const result = await queryFn(params)
      return {
        ...result,
        data: result.data?.map(transformProperty).filter(Boolean) ?? [],
      }
    },
    [queryFn, transformProperty]
  )

  return (
    <VirtualizedExpandableTable
      queryKey={queryKey}
      queryFn={transformedQueryFn}
      columns={columns}
      getRowKey={(item) => item.pid}
      pageSize={20}
      estimateRowSize={56}
      expandedRowHeight={700}
      maxHeight="calc(100vh - 100px)"
      minWidth="900px"
      emptyMessage="No properties found for your department"
      errorMessage="Error loading properties"
      renderExpandedContent={renderExpandedContent}
      onTotalChange={onTotalChange}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
    />
  )
}
