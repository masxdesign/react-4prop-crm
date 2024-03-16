import { createColumnHelper } from '@tanstack/react-table'
import DataTableColumnHeader from '@/components/DataTable/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import LogDialog from '@/routes/dashboard/-ui/LogDialog';
import AlertOpened from '@/routes/dashboard/-ui/AlertOpened';
import AlertEmailClick from '@/routes/dashboard/-ui/AlertEmailClick';
import ProgressCircle from '@/routes/dashboard/-ui/ProgressCircle';
import Linkable from './Linkable';
import ColumnLastContactEach from './ColumnLastContactEach';
import ColumnNextContactEach from './ColumnNextContactEach';
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
  columnHelper.display({
    id: 'note',
    cell: (info) => <LogDialog info={info} />,
    size: 60
  }),
  columnHelper.accessor('last_contact', {
    id: "last_contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date contacted" />
    ),
    cell: (info) => <ColumnLastContactEach info={info} />,
    meta: { label: 'Contact date' }
  }),
  columnHelper.accessor('next_contact', {
    id: 'next_contact',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next contact" />
    ),
    cell: (info) => <ColumnNextContactEach info={info} />,
    meta: { label: 'Contact next date' }
  }),
  columnHelper.accessor('company', {
    id: 'company',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate font-medium" tab="person" />,
  }),
  columnHelper.accessor('alertOpened', {
    id: 'alertOpened',
    header: 'EACH Alert Opened',
    cell: (info) => <AlertOpened info={info} />,
  }),
  columnHelper.accessor('alertEmailClick', {
    id: 'alertEmailClick',
    header: 'EACH Alert clicked',
    cell: (info) => <AlertEmailClick info={info} showDate />,
  }),
  columnHelper.accessor('openedPerc', {
    id: 'openedPerc',
    header: 'EACH Alert opened',
    cell: (info) => <ProgressCircle perc={info.getValue() ?? 0} />
  }),
  columnHelper.accessor('alertPerc', {
    id: 'alertPerc',
    header: 'EACH Alert success',
    cell: (info) => <ProgressCircle perc={info.getValue() ?? 0} />
  }),
  columnHelper.accessor('website', {
    id: 'website',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Website" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate font-medium" tab="person" />,
  }),
  columnHelper.accessor('email', {
    id: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate font-medium" tab="contact" />
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
  columnHelper.accessor((row) => `${row.first} ${row.last}`, {
    id: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full name" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="person" />,
    meta: { label: 'Full name' }
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
  }),
  columnHelper.accessor('postcode', {
    id: 'postcode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Postcode" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="address" />,
  }),
  columnHelper.accessor('a', {
    id: 'a',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Postcode 2" />
    ),
    cell: (info) => <Linkable info={info} className="w-full truncate" tab="address" />,
  }),
]