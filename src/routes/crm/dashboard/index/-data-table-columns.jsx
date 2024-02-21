import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { addLog, deleteLog, fetchLog, updateClient } from '@/api/api-fakeServer';
import DataTableColumnHeader from '@/components/DataTable/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { fuzzySort } from '@/utils/fuzzyFilterSortFn';
import { CalendarIcon, CaretSortIcon, ChatBubbleIcon, EnvelopeClosedIcon, EnvelopeOpenIcon, ResetIcon } from '@radix-ui/react-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table'
import { format, isToday, subDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useAuthStore } from '@/store';
import { cva } from 'class-variance-authority';
import * as Yup from "yup"

const columnHelper = createColumnHelper()

const useLogFieldUpdate = (uid, curr_field, onSuccess) => {
  const queryClient = useQueryClient()

  const user = useAuthStore.use.user()
  const author = user.id

  const mutation = useMutation({
      mutationFn: (data) => Promise.all([
        updateClient({ id: uid }, data),
        addLog({ isJSON: true, message: JSON.stringify({ type: curr_field, data: data[curr_field] }), uid, author })
      ]),
      onSuccess: ([_, log], variables) => {
        queryClient.setQueryData(['clients'], (data) => data.map((row) => ({
          ...row,
          ...row.id === uid ? variables : null
        })))
        queryClient.setQueryData(['log', uid], (rows) => ([...rows, log]))
        onSuccess && onSuccess()
      }
  })

  return mutation
}

const ColumnContactDate = ({ info, onSuccess }) => {
  
  const curr_field = 'contact_date'

  const uid = info.row.original.id

  const value = info.row.getValue(curr_field)

  const mutation = useLogFieldUpdate(uid, curr_field, onSuccess)
  
  const handleSelect = () => {
    mutation.mutate({ [curr_field]: new Date })
  }
 
  const handleClear = () => {
    mutation.mutate({ [curr_field]: null })
  }

  if(mutation.isPending) return <small className='text-muted-foreground flex items-center h-[46px]'>Saving...</small>

  return (
    <div className='flex items-center h-[46px]'>
      <div className='flex flex-col'>
        {value && (
          <small className='opacity-80 text-nowrap'>
            {format(value, "d MMM yyy")}
          </small>
        )}
        <Button variant="default" size="xs" onClick={handleSelect} disabled={isToday(value)}>
          Mark Today
        </Button>
      </div>
      {value && (
        <Tooltip>
          <TooltipTrigger asChild>
            <ResetIcon className="ml-4 h-4 w-4 cursor-pointer" onClick={handleClear} />
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear date contacted</p>
          </TooltipContent>
        </Tooltip>        
      )}
    </div>
  )

}

const ColumnNextContact = ({ info, onSuccess }) => {

  const uid = info.row.original.id

  const [open, setOpen] = useState(false)

  const curr_field = 'contact_next_date'

  const value = info.row.getValue(curr_field)

  const mutation = useLogFieldUpdate(uid, curr_field, onSuccess)

  const handleSelect = (dateValue) => {
    mutation.mutate({ [curr_field]: dateValue })
    setOpen(false)
  }

  const handleClear = (e) => {
    e.preventDefault()
    mutation.mutate({ [curr_field]: null })
    setOpen(false)
  }

  if(mutation.isPending) return <small className='text-muted-foreground flex items-center h-[40px]'>Saving...</small>

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
            variant={"outline"}
            size="xs"
            className={cn(
              "w-[140px] pl-2 text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            {value ? (
              format(value, "d MMM yyy")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            {value && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <ResetIcon className="ml-2 h-4 w-4" onClick={handleClear} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear next contact date</p>
                </TooltipContent>
              </Tooltip>        
            )}
          </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={(date) => date < subDays(new Date(), 1)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )

}

const Linkable = ({ info, className, ...props }) => {

  const value = info.getValue()

  const handleClick = (e) => {
    info.table.options.meta.showSheet(info, e.currentTarget.dataset.tab)
  }

  return (
    <div 
      onClick={handleClick} 
      className={cn(
        "cursor-pointer whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline",
        className
      )} 
      {...props}
    >
      {value?.length > 0 ? value : <i className='font-normal opacity-50'>(empty)</i>}
    </div>
  )
}

const useCategoriesCombiner = (info) => {
  const value = info.row.getValue('categories')
  const { categories } = info.table.options.meta
  return useMemo(() => categories.filter((category) => value.includes(category.value)), [categories, value])
}

const CategoriesPrimitive = ({ info, badgeClassName, ...props }) => {
  const list = useCategoriesCombiner(info)
  return (
    <div className="flex max-w-[150px] space-x-1" {...props}>
      {list.map(({ label }) => (
        <Badge
          variant="secondary"
          key={label}
          className={cn("rounded-sm px-1 font-normal text-nowrap", badgeClassName)}
        >
          {label}
        </Badge>
      ))}
    </div>
  )
}

const Categories = ({ info }) => {
  const { showSheet } = info.table.options.meta
  return (
    <CategoriesPrimitive 
      info={info} 
      badgeClassName="cursor-pointer hover:underline"
      onClick={() => showSheet(info, "categories")} 
    />
  )
}

const infoList = [
  { field: 'email', icon: <Mail className="h-3 w-3" /> },
  { field: 'phone', icon: <Phone className="h-3 w-3" /> },
  { field: 'address', render: (info) => `${info.row.getValue('city')} ${info.row.getValue('postcode')}`, icon: <MapPin className="h-3 w-3" /> }
]

const speechBubbleVariants = cva(
  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm text-left cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-muted",
        author:
          "ml-auto bg-sky-100 text-sky-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const SpeechBubble = ({ className, variant, ...props }) => (
  <div className={cn(speechBubbleVariants({ variant }), className)} {...props} />
)

const LogChatbox = ({ data, onDelete, autoScroll, scrollBehavior }) => {
  const containerRef = useRef(null)

  const scrollDown = useCallback(() => {

    if(!autoScroll) return
    containerRef.current.scroll({ top: containerRef.current.scrollHeight, behavior: scrollBehavior })

  }, [scrollBehavior, autoScroll])

  useEffect(() => {
    scrollDown()
  }, [data, scrollDown])

  return (
    <div ref={containerRef} className='h-[300px] space-y-4 overflow-y-auto'>
      {data.map(({ id, message, variant }) => (
        <SpeechBubble key={id} variant={variant} className='group/speech relative'>
          {message}
          <button onClick={() => onDelete(id)} className='shadow-sm absolute border border-red-400 flex items-center justify-center font-mono rounded-full text-red-700 bg-red-100 right-0 -top-2 h-5 w-5 invisible group-hover/speech:visible'>
            &times;
          </button>
        </SpeechBubble>
      ))}
    </div>
  )
}

const messageSchema = Yup.object().shape({
  message: Yup.string().required()
})

const LogChatboxContainer = ({ info }) => {
  const [autoScroll, setAutoScroll] = useState(true)
  const [scrollBehavior, setScrollBehavior] = useState(undefined)
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)

  const user = useAuthStore.use.user()
  const currUserId = user.id
  const uid = info.row.original.id

  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['log', uid],
    queryFn: () => fetchLog(uid)
  })

  const data = useMemo(() => query.data?.map((row) => {
    let { message } = row
    let variant = row.author === currUserId ? 'author' : 'default'

    if(row.isJSON) {

      variant = 'default'

      let props = { label: null, value: null }
      
      const J = JSON.parse(message)

      switch (J.type) {
        case 'contact_date':

          props.label = 'Last contact'

          if(J.data) {
            props.value = format(J.data, "d MMM yyy")
          }

          break 
        case 'contact_next_date':

          props.label = 'Next contact'

          if(J.data) {
            props.value = format(J.data, "d MMM yyy")
          }
          
          break
        default:
          props = { label: J.type, value: J.data }
      }

      message = (
        <p className='space-x-2'>
          <span className='text-xs'>{props.label}</span>
          {props.value ? (
            <span>{props.value}</span>
          ) : (
            <span>No date</span>
          )}
        </p>
      )
    }

    return {
      ...row,
      variant,
      message
    }
  }), [query.data])

  const DeleteMutation = useMutation({
    mutationKey: ['log', uid],
    mutationFn: deleteLog,
    onSuccess: (_, id) => {
      setAutoScroll(false)
      queryClient.setQueryData(['log', uid], (rows) => rows.filter((row) => row.id !== id))
    }
  })

  const handleDelete = (id) => {
    DeleteMutation.mutate(id)
  }

  const addMutation = useMutation({
    mutationFn: addLog,
    onSuccess: (data) => {
      setAutoScroll(true)
      setScrollBehavior('smooth')
      queryClient.setQueryData(['log', uid], (rows) => ([...rows, data]))
      setValue('')
    }
  })

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const handleSubmit = () => {
    try {

      messageSchema.validateSync({ message: value })
      addMutation.mutate({ message: value, uid, author: currUserId })
      setError(null)

    } catch (e) {
      setError(e.message)
    }
  }

  const handleFocus = () => {
    setError(null)
  }
  
  const handleDateUpdate = () => {
    setAutoScroll(true)
    setScrollBehavior('smooth')
  }

  return (
    <>
       {query.isLoading ? (
          <p>Loading...</p>
        ) : (
          <LogChatbox 
            autoScroll={autoScroll} 
            scrollBehavior={scrollBehavior} 
            data={data} 
            onDelete={handleDelete} 
          />
        )}
        <div>
          <Textarea placeholder="Type your message here." value={value} onFocus={handleFocus} onChange={handleChange} />
          {error && <small className='text-red-500'>{error}</small>}
        </div>
        <div className="flex space-x-4 justify-start items-end">
          <ColumnContactDate info={info} onSuccess={handleDateUpdate} />
          <div className='flex justify-center flex-grow'>
            <Button onClick={handleSubmit}>Make note</Button>
          </div>
          <div>
            <ColumnNextContact info={info} onSuccess={handleDateUpdate} />
          </div>
        </div>
    </>
  )
}

const LogDialog = ({ info }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <ChatBubbleIcon className='cursor-pointer' />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
        <Collapsible> 
          <DialogTitle>
            {info.row.getValue('fullName')}
          </DialogTitle>
          <DialogDescription>
            <CollapsibleTrigger className='flex space-x-2 items-center'> 
              <CategoriesPrimitive info={info} />
              <span>{info.row.getValue('company')}</span>
              <CaretSortIcon className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent asChild className='flex flex-wrap'>
              <span>
                {infoList.map(({ field, render, icon }) => (
                  <span key={field} className='flex space-x-1 mr-4 items-center'>
                    {icon}
                    <span className='text-nowrap'>
                      {render ? render(info) : info.row.getValue(field)}
                    </span>
                  </span>
                ))}
              </span>
            </CollapsibleContent>
          </DialogDescription>
          </Collapsible>
        </DialogHeader>
        <LogChatboxContainer info={info} />        
      </DialogContent>
    </Dialog>
  )
}

export const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    size: 60,
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('categories', {
    id: "categories",
    header: "Categories",
    cell: (info) => <Categories info={info} />,
    filterFn: "arrIncludesSome",
    getUniqueValues: (row) => row.categories
  }),
  columnHelper.accessor('contact_date', {
    id: "contact_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date contacted" />
    ),
    cell: (info) => <ColumnContactDate info={info} />,
    sortingFn: "datetime",
    meta: { label: 'Contact date' }
  }),
  columnHelper.accessor((row) => row.contact_next_date ? new Date(row.contact_next_date): null, {
    id: 'contact_next_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next contact" />
    ),
    cell: (info) => <ColumnNextContact info={info} />,
    sortingFn: "datetime",
    meta: { label: 'Contact next date' }
  }),
  columnHelper.display({
    id: 'note',
    cell: (info) => <LogDialog info={info} />,
    size: 60
  }),
  columnHelper.accessor('first', {
    id: "first",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[150px] truncate" data-tab="person" />
  }),
  columnHelper.accessor('last', {
    id: 'last',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[150px] truncate" data-tab="person" />
  }),
  columnHelper.accessor('company', {
    id: 'company',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[200px] truncate font-medium" data-tab="person" />,
    filterFn: "arrIncludes"
  }),
  columnHelper.accessor((row) => `${row.title} ${row.first} ${row.last}`, {
    id: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full name" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[200px] truncate" data-tab="person" />,
    filterFn: 'fuzzy',
    sortingFn: fuzzySort,
    meta: { label: 'Full name' }
  }),
  columnHelper.accessor('email', {
    id: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[200px] truncate font-medium" data-tab="contact" />
  }),
  columnHelper.accessor('phone', {
    id: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: (info) => <Linkable info={info} className="w-[200px] truncate" data-tab="contact" />
  }),
  columnHelper.accessor('gender', {
    id: 'gender',
    header: "Gender"
  }),
  columnHelper.accessor('city', {
    id: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[200px] truncate" data-tab="address" />,
    filterFn: "arrIncludes",
  }),
  columnHelper.accessor('postcode', {
    id: 'postcode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Postcode" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[100px] truncate" data-tab="address" />,
    filterFn: "arrIncludes",
  }),
  columnHelper.accessor((row) => new Date(row.created), {
    id: 'created',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: (info) => <div className="text-nowrap">{format(info.getValue(), "PPP")}</div>,
    sortingFn: "datetime"
  }),
  // columnHelper.display({
  //   id: "actions",
  //   meta: {
  //     className: "sticky right-0 bg-white"
  //   },
  //   header: () => (
  //     <div className='absolute inset-0 border-s' />
  //   ),
  //   cell: ({ row, table }) => (
  //     <>
  //       <div className='absolute inset-0 border-s' />
  //       <DataTableRowActions table={table} row={row} />
  //     </>
  //   )
  // }),
]

export const initialVisibilty = {
  first: false,
  last: false,
  gender: false
}