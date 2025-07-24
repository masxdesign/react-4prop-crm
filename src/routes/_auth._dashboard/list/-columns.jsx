import { createColumnHelper } from "@tanstack/react-table"
import DataTableColumnHeader from "@/components/DataTable/DataTableColumnHeader"
import ColumnLinkable from "@/components/CRMTable/components/ColumnLinkable"
import ColumnViewButton from "@/components/CRMTable/components/ColumnViewButton"
import { Checkbox } from "@/components/ui/checkbox"
import ColumnNextContactMyList from "@/components/CRMTable/components/ColumnNextContactMyList"
import ColumnEnquiries from "@/components/CRMTable/components/ColumnEnquiries"
import ColumnScalar from "@/components/CRMTable/components/ColumnScalar"
import triggerShowDialog from "@/utils/triggerShowDialog"
import ColumnDateFormat from "@/components/CRMTable/components/ColumnDateFormat"

const columnHelper = createColumnHelper()

class CellFns {
    constructor(info) {
        this.info = info
    }
    triggerShowDialog() {
        this.info.table.options.meta.dialogModel.showDialog(this.info.row.original.id)
    }
    getValue(names = null) {
        const infoValue = this.info.getValue()
        const value = names?.[infoValue] ?? infoValue

        return value
    }
    get value() {
        return this.getValue()
    }
    get original() {
        return this.info.row.original
    }
    get authUserId() {
        return this.info.table.options.meta.authUserId
    }
}

export const version = "1.1"

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
            <div className="p-4">
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label="Select row"
                  className="translate-y-[2px]"
                  disabled={table.options.meta.authUserId === row.original.id}
                />
            </div>
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
            <div className="p-4">
                <ColumnNextContactMyList 
                importId={info.row.original.id} 
                authUserId={info.table.options.meta.authUserId}
                defaultValue={info.row.original.next_contact}
                table={info.table}
                tableDataQueryKey={info.table.options.meta.dataQueryKey}
                />
            </div>
        ),
        meta: { label: 'Next contact' }
    }),
    columnHelper.accessor("created", {
        id: "created",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date added" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnDateFormat
                    value={fns.value}
                    className="w-full truncate text-xs"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
    }),
    columnHelper.accessor((row) => `${row.owner_first} ${row.owner_last}`, {
        id: "owner_fullname",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Added by" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            const value = fns.original.owneruid === fns.authUserId
                ? "You"
                : fns.value
            
            return (
                <ColumnScalar
                    value={value}
                    className="w-full truncate font-medium"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
        meta: { label: "Added by" },
    }),
    columnHelper.accessor("new_message", {
        id: "new_message",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Unanswered" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnScalar
                    value={fns.value}
                    className="w-full truncate font-medium"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
        meta: { label: "Unanswered" }
    }),
    // all_enquiries,shared_properties,new_message,pdf,view,none
    columnHelper.accessor("all_enquiries", {
        id: "all_enquiries",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Enquiries" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnEnquiries 
                    info={info}
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
        size: 240,
        meta: { label: "Enquiries" }
    }),
    columnHelper.accessor("company", {
        id: "company",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Company" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnScalar
                    value={fns.value}
                    className="w-full truncate font-medium"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
    }),
    columnHelper.accessor("email", {
        id: "email",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnScalar
                    value={fns.value}
                    className="w-full truncate font-medium"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
    }),
    columnHelper.accessor("first", {
        id: "first",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="First" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnScalar
                    value={fns.value}
                    className="w-full truncate"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
    }),
    columnHelper.accessor("last", {
        id: "last",
        header: ({ column }) => (
            <DataTableColumnHeader 
                column={column} 
                title="Last" 
            />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnScalar
                    value={fns.value}
                    className="w-full truncate"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
    }),
    columnHelper.accessor((row) => `${row.first} ${row.last}`, {
        id: "fullName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Full name" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnScalar
                    value={fns.value}
                    className="w-full truncate"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
        meta: { label: "Full name" },
    }),
    columnHelper.accessor("phone", {
        id: "phone",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Phone" />
        ),
        cell: (info) => {
            const fns = new CellFns(info)

            return (
                <ColumnScalar
                    value={fns.value}
                    className="w-full truncate"
                    onClick={fns.triggerShowDialog.bind(fns)}
                />
            )
        },
    })
]
