import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { Loader2, Eye, Building2 } from 'lucide-react'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import InlineCalendar from '@/components/Magazine/ui/InlineCalendar'
import VirtualizedInfiniteTable from '@/components/ui-custom/VirtualizedInfiniteTable/VirtualizedInfiniteTable'
import {
  bulkInsertSchedulers,
  previewBulkInsert,
  previewBulkInsertByCompany,
  getCompanyPreviewProperties,
  getDiagramUrl
} from '@/services/propertySchedulerService'
import PanZoomImage from '@/components/ui-custom/PanZoomImage/PanZoomImage'
import { schedulerQueriesQueryOptions } from '@/features/propertyScheduler/services'
import usePropertyTypeLabels from '@/hooks/usePropertyTypeLabels'
import propertyParse from '@/utils/propertyParse'

const tomorrow = addDays(new Date(), 1)
const minDateStr = format(tomorrow, 'yyyy-MM-dd')

const schema = yup.object({
  advertiser_id: yup.string().required('Property filter is required'),
  start_date: yup
    .string()
    .required('Start date is required')
    .test('min-date', 'Start date must be tomorrow or later', (value) => {
      if (!value) return false
      return value >= minDateStr
    }),
  week_no: yup
    .number()
    .typeError('Number of weeks is required')
    .required('Number of weeks is required')
    .min(1, 'Must be at least 1 week'),
})

const defaultValues = {
  advertiser_id: '',
  start_date: minDateStr,
  week_no: 1,
}

export default function PropertySchedulerForm() {
  const [result, setResult] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewParams, setPreviewParams] = useState(null)
  const [expandedCompany, setExpandedCompany] = useState('')
  const sessionIdRef = useRef(null)

  const { data: queries = [], isLoading: queriesLoading } = useQuery(schedulerQueriesQueryOptions())
  const { getSubtypeLabels, hasData: hasSubtypeData } = usePropertyTypeLabels()

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  })

  // Watch form values for live stats
  const watchedValues = form.watch()
  const isFormValid = Boolean(
    watchedValues.advertiser_id &&
    watchedValues.start_date &&
    watchedValues.start_date >= minDateStr &&
    Number.isInteger(watchedValues.week_no) &&
    watchedValues.week_no >= 1
  )

  // Live stats query - only fetches stats
  const {
    data: liveStats,
    isFetching: liveStatsFetching,
  } = useQuery({
    queryKey: ['property-scheduler-stats', watchedValues.advertiser_id, watchedValues.start_date, watchedValues.week_no],
    queryFn: async () => {
      const result = await previewBulkInsert({
        advertiser_id: watchedValues.advertiser_id,
        start_date: watchedValues.start_date,
        week_no: watchedValues.week_no,
        cursor: 0,
        limit: 1, // Minimal fetch just to get stats
      })
      return {
        total: result.total,
        toInsertCount: result.toInsertCount,
        toSkipCount: result.toSkipCount,
      }
    },
    enabled: isFormValid,
    staleTime: 30000, // Cache for 30 seconds
  })

  const mutation = useMutation({
    mutationFn: bulkInsertSchedulers,
    onSuccess: (data) => {
      setResult({ success: true, ...data })
      setPreviewOpen(false)
    },
    onError: (error) => {
      setResult({
        success: false,
        error: error.response?.data?.error || error.message || 'An error occurred',
      })
    },
  })

  const onSubmit = (data) => {
    setResult(null)
    mutation.mutate(data)
  }

  const handlePreview = async () => {
    const isValid = await form.trigger()
    if (!isValid) return

    const values = form.getValues()
    sessionIdRef.current = null
    setPreviewParams(values)
    setExpandedCompany('')
    setPreviewOpen(true)
  }

  const handleConfirmInsert = () => {
    if (!previewParams) return
    onSubmit(previewParams)
  }

  // Company-grouped preview query
  const {
    data: companyPreview,
    isLoading: companyPreviewLoading,
  } = useQuery({
    queryKey: ['property-scheduler-preview-companies', previewParams],
    queryFn: async () => {
      const result = await previewBulkInsertByCompany({
        advertiser_id: previewParams.advertiser_id,
        start_date: previewParams.start_date,
        week_no: previewParams.week_no,
        sessionId: sessionIdRef.current,
      })
      if (result.sessionId) {
        sessionIdRef.current = result.sessionId
      }
      return result
    },
    enabled: previewOpen && !!previewParams,
  })

  // Create query function factory for company properties
  const createCompanyPropertiesQueryFn = (companyId) => async ({ pageParam, pageSize }) => {
    const result = await getCompanyPreviewProperties({
      sessionId: sessionIdRef.current,
      companyId,
      cursor: pageParam || 0,
      limit: pageSize,
    })

    return {
      data: result.items || [],
      nextCursor: result.nextCursor,
      total: result.total,
    }
  }

  // Format address using propertyParse
  const formatAddress = (item) => {
    return propertyParse.addressText({ showMore: true, showBuilding: true, showPostcode: true })(item)
  }

  // Format size using propertyParse
  const formatSize = (item) => {
    const size = propertyParse.size(item)
    const parts = []
    if (size.isIn && size.text) {
      parts.push(size.text)
    }
    if (size.isExt && size.land?.text) {
      parts.push(`Land: ${size.land.text}`)
    }
    return parts.join(' | ') || '-'
  }

  // Format tenure using propertyParse
  const formatTenure = (item) => {
    const tenure = propertyParse.tenure(item)
    const parts = []
    if (tenure.isSale && tenure.price) {
      parts.push(tenure.price)
    }
    if (tenure.isRent && tenure.rent) {
      parts.push(tenure.rent)
    }
    return parts.join(' / ') || tenure.text || '-'
  }

  // Table columns
  const columns = [
    {
      key: 'action',
      header: 'Action',
      width: 60,
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${item.action === 'insert'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
            }`}
        >
          {item.action === 'insert' ? 'Insert' : 'Skip'}
        </span>
      ),
    },
    {
      key: 'pid',
      header: 'PID',
      width: 100,
      render: (item) => <span className="font-mono text-xs">{item.pid}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      width: 500,
      render: (item) => (
        <span className="truncate" title={formatAddress(item)}>
          {formatAddress(item) || '-'}
        </span>
      ),
    },
    {
      key: 'subtypes',
      header: 'Subtypes',
      width: 600,
      render: (item) => {
        if (!hasSubtypeData || !item.pstids) return '-'
        const labels = getSubtypeLabels(item.pstids)
        const text = labels.join(', ')
        return (
          <span className="truncate" title={text}>
            {text || '-'}
          </span>
        )
      },
    },
    {
      key: 'size',
      header: 'Size',
      width: 200,
      render: (item) => formatSize(item),
    },
    {
      key: 'tenure',
      header: 'Tenure/Price',
      width: 200,
      render: (item) => formatTenure(item),
    },
  ]

  const selectedAdvertiserId = watchedValues.advertiser_id

  return (
    <div className="flex gap-6 max-w-6xl mx-auto">
      {/* Left side - Form */}
      <div className="w-[400px] shrink-0 space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Property Scheduler</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule properties for magazine publication. Select a property filter, choose the start date, and set the duration.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="advertiser_id"
                  render={({ field }) => {
                    // Find the selected query to display its title
                    const selectedQuery = queries.find(q =>
                      (typeof q === 'string' ? q : q.advertiser_id) === field.value
                    )
                    const selectedLabel = selectedQuery
                      ? (typeof selectedQuery === 'string' ? selectedQuery : selectedQuery.title || selectedQuery.advertiser_id)
                      : null

                    return (
                      <FormItem>
                        <FormLabel>Property Filter</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={queriesLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={queriesLoading ? 'Loading...' : 'Select a filter...'}>
                                {selectedLabel || (queriesLoading ? 'Loading...' : 'Select a filter...')}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {queries
                              .map((query) => {
                                // Query objects now have advertiser_id and title properties
                                const queryValue = typeof query === 'string' ? query : (query.advertiser_id || '')
                                const queryLabel = typeof query === 'string' ? query : (query.title || query.advertiser_id || '')

                                return { queryValue, queryLabel }
                              })
                              .filter(({ queryValue }) => queryValue !== '') // Filter out empty values
                              .map(({ queryValue, queryLabel }) => (
                                <SelectItem key={queryValue} value={queryValue}>
                                  {queryLabel}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <InlineCalendar
                  control={form.control}
                  name="start_date"
                  label="Start Date"
                  minDate={minDateStr}
                />

                <FormField
                  control={form.control}
                  name="week_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Weeks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Live Stats */}
                {isFormValid && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-md border border-green-200">
                      {liveStatsFetching ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-green-600" />
                      ) : (
                        <div className="text-xl font-semibold text-green-600">{liveStats?.toInsertCount ?? '-'}</div>
                      )}
                      <div className="text-xs text-green-700">To Insert</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-md border border-yellow-200">
                      {liveStatsFetching ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-yellow-600" />
                      ) : (
                        <div className="text-xl font-semibold text-yellow-600">{liveStats?.toSkipCount ?? '-'}</div>
                      )}
                      <div className="text-xs text-yellow-700">To Skip</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-md border border-blue-200">
                      {liveStatsFetching ? (
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                      ) : (
                        <div className="text-xl font-semibold text-blue-600">{liveStats?.total ?? '-'}</div>
                      )}
                      <div className="text-xs text-blue-700">Total</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handlePreview}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Insert Schedulers'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-lg">Result</CardTitle>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                  {result.success ? 'Success' : 'Error'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-3xl font-semibold text-green-600">{result.inserted || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Inserted</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-3xl font-semibold text-yellow-500">{result.skipped || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Skipped</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-md">
                      <div className="text-3xl font-semibold text-blue-500">{result.total || 0}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total</div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-muted-foreground text-sm">
                    {result.message || 'Operation completed successfully'}
                  </div>
                </>
              ) : (
                <div className="p-3 bg-red-100 rounded-md text-red-800 text-sm">{result.error}</div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right side - Diagram Viewer */}
      {selectedAdvertiserId && (
        <div className="flex-1 min-w-0">
          <Card className="h-[900px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Query Diagram</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-60px)]">
              <PanZoomImage
                key={selectedAdvertiserId}
                src={getDiagramUrl(selectedAdvertiserId)}
                alt={`Diagram for ${selectedAdvertiserId}`}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Properties</DialogTitle>
            <DialogDescription>
              Review the properties that will be scheduled. Green items will be inserted, yellow items will be skipped (overlapping schedules).
            </DialogDescription>
          </DialogHeader>

          {companyPreviewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : companyPreview ? (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-3 gap-4 py-2">
                <div className="text-center p-3 bg-green-50 rounded-md border border-green-200">
                  <div className="text-2xl font-semibold text-green-600">{companyPreview.toInsertCount}</div>
                  <div className="text-xs text-green-700">To Insert</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <div className="text-2xl font-semibold text-yellow-600">{companyPreview.toSkipCount}</div>
                  <div className="text-xs text-yellow-700">To Skip</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-md border border-blue-200">
                  <div className="text-2xl font-semibold text-blue-600">{companyPreview.total}</div>
                  <div className="text-xs text-blue-700">Total</div>
                </div>
              </div>

              {/* Company Accordion List */}
              <div className="flex-1 min-h-0 overflow-y-auto border rounded-md">
                <Accordion
                  type="single"
                  collapsible
                  value={expandedCompany}
                  onValueChange={setExpandedCompany}
                >
                  {companyPreview.companies.map((company) => (
                    <AccordionItem key={company.cid} value={String(company.cid)}>
                      <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                        <div className="flex items-center gap-3 flex-1">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-left flex-1 truncate">{company.name}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
                              {company.toInsertCount}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                              {company.toSkipCount}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              {company.total}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4">
                        {expandedCompany === String(company.cid) && sessionIdRef.current && (
                          <div className="border rounded-md overflow-hidden">
                            <VirtualizedInfiniteTable
                              queryKey={['property-scheduler-preview-company', sessionIdRef.current, company.cid]}
                              queryFn={createCompanyPropertiesQueryFn(company.cid)}
                              columns={columns}
                              getRowKey={(item) => item.pid}
                              pageSize={50}
                              estimateRowSize={48}
                              maxHeight="300px"
                              minWidth={1600}
                              emptyMessage="No properties"
                              errorMessage="Error loading properties"
                            />
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInsert}
              disabled={mutation.isPending || !companyPreview?.toInsertCount}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inserting...
                </>
              ) : (
                `Insert ${companyPreview?.toInsertCount || 0} Properties`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
