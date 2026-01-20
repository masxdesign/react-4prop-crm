import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { Loader2, Eye } from 'lucide-react'

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
import InlineCalendar from '@/components/Magazine/ui/InlineCalendar'
import VirtualizedInfiniteTable from '@/components/ui-custom/VirtualizedInfiniteTable/VirtualizedInfiniteTable'
import { bulkInsertSchedulers, previewBulkInsert } from '@/services/propertySchedulerService'
import { schedulerQueriesQueryOptions } from '@/features/propertyScheduler/services'
import usePropertyTypeLabels from '@/hooks/usePropertyTypeLabels'
import propertyParse from '@/utils/propertyParse'

const tomorrow = addDays(new Date(), 1)
const minDateStr = format(tomorrow, 'yyyy-MM-dd')

const schema = yup.object({
  advertiser_id: yup.string().required('Advertiser query is required'),
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
  const [previewStats, setPreviewStats] = useState(null)
  const sessionIdRef = useRef(null)

  const { data: queries = [], isLoading: queriesLoading } = useQuery(schedulerQueriesQueryOptions())
  const { getSubtypeLabels, hasData: hasSubtypeData } = usePropertyTypeLabels()

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
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
    setPreviewStats(null)
    setPreviewOpen(true)
  }

  const handleConfirmInsert = () => {
    if (!previewParams) return
    onSubmit(previewParams)
  }

  // Query function for the virtualized table
  const previewQueryFn = async ({ pageParam, pageSize }) => {
    const result = await previewBulkInsert({
      ...previewParams,
      cursor: pageParam || 0,
      limit: pageSize,
      sessionId: sessionIdRef.current,
    })

    // Store session ID for subsequent requests
    if (result.sessionId) {
      sessionIdRef.current = result.sessionId
    }

    // Store stats on first load
    if (!previewStats && result.total !== undefined) {
      setPreviewStats({
        total: result.total,
        toInsertCount: result.toInsertCount,
        toSkipCount: result.toSkipCount,
      })
    }

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
      key: 'status',
      header: 'Status',
      width: '80px',
      render: (item) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            item.status === 'insert'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {item.status === 'insert' ? 'Insert' : 'Skip'}
        </span>
      ),
    },
    {
      key: 'pid',
      header: 'PID',
      width: '100px',
      render: (item) => <span className="font-mono text-xs">{item.pid}</span>,
    },
    {
      key: 'address',
      header: 'Address',
      flex: 2,
      render: (item) => (
        <span className="truncate" title={formatAddress(item)}>
          {formatAddress(item) || '-'}
        </span>
      ),
    },
    {
      key: 'subtypes',
      header: 'Subtypes',
      flex: 1,
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
      width: '150px',
      render: (item) => formatSize(item),
    },
    {
      key: 'tenure',
      header: 'Tenure/Price',
      width: '150px',
      render: (item) => formatTenure(item),
    },
  ]

  return (
    <div className="max-w-md mx-auto space-y-5">
      <h1 className="text-2xl font-semibold">Property Scheduler</h1>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="advertiser_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advertiser Query</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={queriesLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={queriesLoading ? 'Loading...' : 'Select a query...'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {queries.map((query) => (
                          <SelectItem key={query} value={query}>
                            {query.charAt(0).toUpperCase() + query.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Preview Properties</DialogTitle>
            <DialogDescription>
              Review the properties that will be scheduled. Green items will be inserted, yellow items will be skipped (overlapping schedules).
            </DialogDescription>
          </DialogHeader>

          {previewStats && (
            <div className="grid grid-cols-3 gap-4 py-2">
              <div className="text-center p-3 bg-green-50 rounded-md border border-green-200">
                <div className="text-2xl font-semibold text-green-600">{previewStats.toInsertCount}</div>
                <div className="text-xs text-green-700">To Insert</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <div className="text-2xl font-semibold text-yellow-600">{previewStats.toSkipCount}</div>
                <div className="text-xs text-yellow-700">To Skip</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="text-2xl font-semibold text-blue-600">{previewStats.total}</div>
                <div className="text-xs text-blue-700">Total</div>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden">
            {previewParams && (
              <VirtualizedInfiniteTable
                queryKey={['property-scheduler-preview', previewParams]}
                queryFn={previewQueryFn}
                columns={columns}
                getRowKey={(item) => item.pid}
                pageSize={50}
                estimateRowSize={48}
                maxHeight="400px"
                minWidth="900px"
                emptyMessage="No properties found"
                errorMessage="Error loading preview"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInsert}
              disabled={mutation.isPending || !previewStats?.toInsertCount}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inserting...
                </>
              ) : (
                `Insert ${previewStats?.toInsertCount || 0} Properties`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
