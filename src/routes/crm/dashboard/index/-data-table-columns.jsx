import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { addLog, fetchLog, updateClient } from '@/api/api-fakeServer';
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

const columnHelper = createColumnHelper()

const useLogFieldUpdate = (uid, curr_field) => {
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
      }
  })

  return mutation
}

const ColumnContactDate = ({ info }) => {
  
  const curr_field = 'contact_date'

  const uid = info.row.original.id

  const value = info.row.getValue(curr_field)

  const mutation = useLogFieldUpdate(uid, curr_field)
  
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

const ColumnNextContact = ({ info }) => {

  const uid = info.row.original.id

  const [open, setOpen] = useState(false)

  const curr_field = 'contact_next_date'

  const value = info.row.getValue(curr_field)

  const mutation = useLogFieldUpdate(uid, curr_field)

  const handleSelect = (dateValue) => {
    mutation.mutate({ [curr_field]: dateValue }, {
      onSuccess: () => {
        setOpen(false)
      }
    })
  }

  const handleClear = () => {
    mutation.mutate({ [curr_field]: null }, {
      onSuccess: () => {
        setOpen(false)
      }
    })
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

  const handleClick = (e) => {
    info.table.options.meta.showSheet(info, e.target.dataset.tab)
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
      {info.getValue()}
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
  "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
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
  <span className={cn(speechBubbleVariants({ variant }), className)} {...props} />
)

const LogChat = ({ data }) => {
  const ref = useRef()
  const onMountRef = useRef(false)

  useLayoutEffect(() => {
    
    ref.current.scroll({ top: ref.current.scrollHeight, behavior: onMountRef.current ? 'smooth' : undefined })

    onMountRef.current = true

  }, [data])

  return (
    <div ref={ref} className='h-[300px] space-y-4 overflow-y-auto'>
      {data.map(({ id, message, variant }) => (
        <SpeechBubble key={id} variant={variant}>
          {message}
        </SpeechBubble>
      ))}
    </div>
  )
}

const LogDialog = ({ info }) => {

  const user = useAuthStore.use.user()
  const currUserId = user.id
  const uid = info.row.original.id

  const queryClient = useQueryClient()

  const [value, setValue] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['log', uid],
    queryFn: () => fetchLog(uid),
    select: (data) => data.map((row) => {
      
      let message = row.message

      if(row.isJSON) {
        const _j = JSON.parse(row.message)
        switch (_j.type) {
          case 'contact_date':
            message = _j.data ? `Last contact ${format(_j.data, "d MMM yyy")}`: ''
            break 
          case 'contact_next_date':
            message = _j.data ? `Next contact ${format(_j.data, "d MMM yyy")}`: ''
            break
          default:
            message = '(empty)'
        }
      }

      return {
        ...row,
        variant: row.author === currUserId ? 'author' : 'default',
        message
      }
    }) 
  })
  
  const mutation = useMutation({
    mutationFn: addLog,
    onSuccess: (data) => {
      queryClient.setQueryData(['log', uid], (rows) => ([...rows, data]))
      setValue('')
    }
  })

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  const handleSubmit = () => {
    mutation.mutate({ message: value, uid, author: currUserId })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ChatBubbleIcon className='cursor-pointer' />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
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
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <LogChat data={data} />
        )}
        <div>
          <Textarea placeholder="Type your message here." value={value} onChange={handleChange} />
        </div>
        <div className="flex space-x-4 justify-start items-end">
          <ColumnContactDate info={info} />
          <div className='flex justify-center flex-grow'>
            <Button onClick={handleSubmit}>Make note</Button>
          </div>
          <div>
            <ColumnNextContact info={info} />
          </div>
        </div>
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
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('categories', {
    header: "Categories",
    cell: (info) => <Categories info={info} />,
    filterFn: "arrIncludesSome",
    getUniqueValues: (row) => row.categories
  }),
  columnHelper.accessor('contact_date', {
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
    cell: (info) => <LogDialog info={info} />
  }),
  columnHelper.accessor('first', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[150px] truncate" data-tab="person" />
  }),
  columnHelper.accessor('last', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[150px] truncate" data-tab="person" />
  }),
  columnHelper.accessor('company', {
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
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[200px] truncate font-medium" data-tab="contact" />
  }),
  columnHelper.accessor('phone', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: (info) => <Linkable info={info} className="w-[200px] truncate" data-tab="contact" />
  }),
  columnHelper.accessor('gender', {
    header: "Gender"
  }),
  columnHelper.accessor('city', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[200px] truncate" data-tab="address" />,
    filterFn: "arrIncludes",
  }),
  columnHelper.accessor('postcode', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Postcode" />
    ),
    cell: (info) => <Linkable info={info} className="max-w-[100px] truncate" data-tab="address" />,
    filterFn: "arrIncludes",
  }),
  columnHelper.accessor((row) => format(row.created, "PPP"), {
    id: 'created',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: (info) => <div className="text-nowrap">{info.getValue()}</div>,
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