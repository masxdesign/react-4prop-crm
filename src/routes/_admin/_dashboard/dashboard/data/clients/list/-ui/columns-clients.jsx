import { format } from 'date-fns';
import { createColumnHelper } from '@tanstack/react-table'
import DataTableColumnHeader from '@/components/DataTable/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { fuzzySort } from '@/utils/fuzzyFilterSortFn';
import Linkable from './Linkable';
import Categories from '../../../../../../../-ui/Categories';
import LogDialog from '../../../../../../../-ui/LogDialog';
import ColumnNextContactClients from '../../-ui/ColumnNextContactClients';
import ColumnContactDateClients from '../../-ui/ColumnContactDateClients';

const columnHelper = createColumnHelper()

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
  columnHelper.accessor('last_contact', {
    id: "last_contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date contacted" />
    ),
    cell: (info) => <ColumnContactDateClients info={info} />,
    sortingFn: "datetime",
    meta: { label: 'Contact date' }
  }),
  columnHelper.accessor('next_contact', {
    id: 'next_contact',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next contact" />
    ),
    cell: (info) => <ColumnNextContactClients info={info} />,
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
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="person" />
  }),
  columnHelper.accessor('last', {
    id: 'last',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="person" />
  }),
  columnHelper.accessor('company', {
    id: 'company',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate font-medium" tab="person" />,
    filterFn: "arrIncludes"
  }),
  columnHelper.accessor((row) => `${row.title} ${row.first} ${row.last}`, {
    id: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full name" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="person" />,
    filterFn: 'fuzzy',
    sortingFn: fuzzySort,
    meta: { label: 'Full name' }
  }),
  columnHelper.accessor('email', {
    id: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate font-medium" tab="contact" />
  }),
  columnHelper.accessor('phone', {
    id: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="contact" />
  }),
  columnHelper.accessor('city', {
    id: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="address" />,
    filterFn: "arrIncludes",
  }),
  columnHelper.accessor('postcode', {
    id: 'postcode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Postcode" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="address" />,
    filterFn: "arrIncludes",
  }),
  columnHelper.accessor((row) => new Date(row.created), {
    id: 'created',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: (info) => <div className="text-nowrap">{format(info.getValue(), "PPP")}</div>,
    sortingFn: "datetime"
  })
]