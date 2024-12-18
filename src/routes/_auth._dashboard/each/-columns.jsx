import { createColumnHelper } from '@tanstack/react-table'
import DataTableColumnHeader from '@/components/DataTable/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import ProgressCircle from '@/components/ProgressCircle';
import ColumnLinkable from "@/components/CRMTable/components/ColumnLinkable"
import ColumnViewButton from '@/components/CRMTable/components/ColumnViewButton';
import { COMPANY_TYPE_NAMES } from '@/constants';
import ColumnNextContactEach from './-ui/ColumnNextContactEach';
import ColumnLastMailShot from '@/components/CRMTable/components/ColumnLastMailShot';
import { AlertEmailClick, LastContact } from '@/components/CRMTable/components';
import AlertOpened from '@/components/CRMTable/components/AlertOpened';

const columnHelper = createColumnHelper()

export const version = "v2.2"

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
    cell: ({ row, table }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
        disabled={table.options.meta.authUserId === row.original.id}
      />
    ),
    size: 60,
    enableSorting: false,
    enableHiding: false
  }),
  columnHelper.display({
    id: 'note',
    cell: (info) => <ColumnViewButton info={info} />,
    size: 80
  }),
  columnHelper.accessor('next_contact', {
    id: 'next_contact',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Next contact" />
    ),
    cell: (info) => (
      <ColumnNextContactEach 
        id={info.row.original.id} 
        defaultValue={info.row.original.next_contact}
        table={info.table}
        tableDataQueryKey={info.table.options.meta.dataQueryKey}
      />
    ),
    meta: { label: 'Contact next date' }
  }),
  columnHelper.accessor('last_contact', {
    id: "last_contact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last contact" />
    ),
    cell: (info) => (
      <LastContact 
        value={info.row.original.last_contact} 
        unreadTotal={info.row.original.unread_total} 
      />
    ),
    meta: { label: 'Last contact' },
    minSize: 220
  }),
  columnHelper.accessor('mail_list_max_date_sent', {
    id: "mail_list_max_date_sent",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last mailshot" />
    ),
    cell: (info) => (
      <ColumnLastMailShot 
        maxDateSent={info.row.original.mail_list_max_date_sent} 
        templateName={info.row.original.mail_list_template_name} 
        total={info.row.original.mail_list_total}
      />
    ),
    meta: { label: 'Last contact' },
    minSize: 220
  }),
  columnHelper.accessor('type', {
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: (info) => <ColumnLinkable info={info} names={COMPANY_TYPE_NAMES} className="w-full truncate font-medium" tab="person" />,
    minSize: 185
  }),
  columnHelper.accessor('company', {
    id: 'company',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate font-medium" tab="person" />,
  }),
  columnHelper.accessor('department', {
    id: 'department',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Department" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate font-medium" tab="person" />,
  }),
  columnHelper.accessor('position', {
    id: 'position',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Position" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate font-medium" tab="person" />,
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
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate font-medium" tab="person" />,
  }),
  columnHelper.accessor('email', {
    id: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate font-medium" tab="contact" />
  }),
  columnHelper.accessor('first', {
    id: "first",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate" tab="person" />
  }),
  columnHelper.accessor('last', {
    id: 'last',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate" tab="person" />
  }),
  columnHelper.accessor((row) => `${row.first} ${row.last}`, {
    id: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full name" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate" tab="person" />,
    meta: { label: 'Full name' }
  }),
  columnHelper.accessor('phone', {
    id: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate" tab="contact" />
  }),
  columnHelper.accessor('city', {
    id: 'city',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate" tab="address" />,
  }),
  columnHelper.accessor('postcode', {
    id: 'postcode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Postcode" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate" tab="address" />,
  }),
  columnHelper.accessor('a', {
    id: 'a',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Postcode 2" />
    ),
    cell: (info) => <ColumnLinkable info={info} className="w-full truncate" tab="address" />,
  }),
]