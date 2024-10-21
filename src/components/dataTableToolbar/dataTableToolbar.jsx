import { useMemo } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import DataTableFacetedFilter from "../dataTableFacetedFilter"
import DataTableViewOptions from "../DataTableViewOptions"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

const useFacets = (column) => {
    return useMemo(() => ([...column.getFacetedUniqueValues().keys()]
        .sort()
        .map((value) => ({
            value,
            label: value
        }))), 
        [column.getFacetedUniqueValues()]
    )
}

const DataTableToolbar = ({ table, onInputFilterChange, inputFilter }) => {
  const isFiltered = table.getState().columnFilters.length > 0

  const cities = useFacets(table.getColumn("city"))
  const postcodes = useFacets(table.getColumn("postcode"))
  const companies = useFacets(table.getColumn("company"))

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter all columns..."
          value={inputFilter ?? ""}
          onChange={(event) => onInputFilterChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("company") && (
          <DataTableFacetedFilter
            column={table.getColumn("company")}
            title="Companies"
            options={companies}
          />
        )}
        {table.getColumn("city") && (
          <DataTableFacetedFilter
            column={table.getColumn("city")}
            title="Cities"
            options={cities}
          />
        )}
        {table.getColumn("postcode") && (
          <DataTableFacetedFilter
            column={table.getColumn("postcode")}
            title="Postcodes"
            options={postcodes}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

export default DataTableToolbar