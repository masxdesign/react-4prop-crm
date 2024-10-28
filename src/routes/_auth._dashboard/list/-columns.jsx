import { createColumnHelper } from "@tanstack/react-table"
import DataTableColumnHeader from "@/components/DataTable/DataTableColumnHeader"
import ColumnLinkable from "@/components/CRMTable/components/ColumnLinkable"
import ColumnViewButton from "@/components/CRMTable/components/ColumnViewButton"
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnNextContactEach } from "@/components/CRMTable/components"
import ColumnNextContactMyList from "@/components/CRMTable/components/ColumnNextContactMyList"

const columnHelper = createColumnHelper()

export const version = "1.0.1"

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
        id: "note",
        cell: (info) => <ColumnViewButton info={info} />,
        size: 80,
    }),
    columnHelper.accessor('next_contact', {
        id: 'next_contact',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Next contact" />
        ),
        cell: (info) => (
          <ColumnNextContactMyList 
            importId={info.row.original.id} 
            authUserId={info.table.options.meta.authUserId}
            defaultValue={info.row.original.next_contact}
            table={info.table}
            tableDataQueryKey={info.table.options.meta.dataQueryKey}
          />
        ),
        meta: { label: 'Next contact' }
    }),
    columnHelper.accessor("created", {
        id: "created",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date added" />
        ),
        cell: (info) => (
            <ColumnLinkable
                info={info}
                dateFormat
                className="w-full truncate font-medium"
            />
        ),
    }),
    columnHelper.accessor("gradesharecount", {
        id: "gradesharecount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Share count" />
        ),
        cell: (info) => (
            <ColumnLinkable
                info={info}
                className="w-full truncate font-medium"
            />
        ),
    }),
    columnHelper.accessor("company", {
        id: "company",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Company" />
        ),
        cell: (info) => (
            <ColumnLinkable
                info={info}
                className="w-full truncate font-medium"
            />
        ),
    }),
    columnHelper.accessor("email", {
        id: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: (info) => (
            <ColumnLinkable
                info={info}
                className="w-full truncate font-medium"
            />
        ),
    }),
    columnHelper.accessor("first", {
        id: "first",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="First" />
        ),
        cell: (info) => (
            <ColumnLinkable 
                info={info} 
                className="w-full truncate" 
            />
        ),
    }),
    columnHelper.accessor("last", {
        id: "last",
        header: ({ column }) => (
            <DataTableColumnHeader 
                column={column} 
                title="Last" 
            />
        ),
        cell: (info) => (
            <ColumnLinkable 
                info={info} 
                className="w-full truncate" 
            />
        ),
    }),
    columnHelper.accessor((row) => `${row.first} ${row.last}`, {
        id: "fullName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Full name" />
        ),
        cell: (info) => (
            <ColumnLinkable info={info} className="w-full truncate" />
        ),
        meta: { label: "Full name" },
    }),
    columnHelper.accessor("phone", {
        id: "phone",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Phone" />
        ),
        cell: (info) => (
            <ColumnLinkable info={info} className="w-full truncate" />
        ),
    })
]
