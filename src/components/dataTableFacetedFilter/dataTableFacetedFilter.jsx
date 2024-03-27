import { useEffect, useId, useMemo, useRef, useState } from "react"
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Separator } from "../ui/separator"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useVirtualizer } from "@tanstack/react-virtual"

const VList = ({ column, options, facets, selectedValues, multiple, disableFacets }) => {

    const parentRef = useRef(null)

    const rowVirtualizer = useVirtualizer({
      count: options.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 35,
      overscan: 5
    })

    const handleSelect = (option) => {
        const isSelected = selectedValues.has(option.value)

        if (multiple) {

          if (isSelected) {
              selectedValues.delete(option.value)
          } else {
              selectedValues.add(option.value)
          }          

        } else {

          selectedValues.clear()

          if (!isSelected) {
            selectedValues.add(option.value)
          }

        }

        const filterValues = Array.from(selectedValues)
          
        column?.setFilterValue(
            filterValues.length ? filterValues : undefined
        )

    }

    return (
        <div ref={parentRef} className={`max-h-[300px] overflow-y-auto overflow-x-hidden`}>
          <div 
            style={{ 
              height: `${rowVirtualizer.getTotalSize()}px`, 
              position: "relative", 
              width: "100%" 
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const option = options[virtualRow.index]
              const isSelected = selectedValues.has(option.value)
              return (
                  <CommandItem
                      key={virtualRow.index}
                      style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onSelect={() => handleSelect(option)}
                  >
                      <div
                          className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                          )}
                      >
                          <CheckIcon className={cn("h-4 w-4")} />
                      </div>
                      {option.icon && (
                          <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="truncate">{option.label === "" ? <i className="opacity-50">(empty)</i> : option.label}</span>
                      {!disableFacets && facets?.get(option.value) && (
                          <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                              {facets.get(option.value)}
                          </span>
                      )}
                  </CommandItem>
              )
            })}
          </div>
        </div>
    )
}

const VCommand = ({ title, column, facets, options, selectedValues, multiple, disableFacets }) => {

    const [search, setSearch] = useState('')

    const filteredOptions = useMemo(() => options.filter((option) =>
      option.value.toLowerCase().includes(search.toLowerCase() ?? [])
    ), [options, search])

    const handleKeyDown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
        }
    }

    /** fix!! */
    useEffect(() => {

      if(options.length < 1) {
        setSearch(' ')
      }

    }, [options.length])

    return (
        <Command shouldFilter={false} onKeyDown={handleKeyDown}>
          <CommandInput onValueChange={setSearch} placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <VList 
                column={column}
                options={filteredOptions} 
                facets={facets} 
                disableFacets={disableFacets}
                selectedValues={selectedValues} 
                multiple={multiple}
              />
            </CommandGroup>
          </CommandList>
          {selectedValues.size > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => column?.setFilterValue(undefined)}
                  className="justify-center text-center"
                >
                  Clear filters
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </Command>
    )
}

const DataTableFacetedFilter = ({
    column,
    title,
    data,
    multiple,
    disableFacets
}) => {
  const { facets, options } = data
  const selectedValues = new Set(column?.getFilterValue())

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label === "" ? <i className="opacity-50">(empty)</i> : option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-[280px] p-0`} align="start">
        <VCommand
          column={column}
          title={title} 
          facets={facets}
          options={options}
          selectedValues={selectedValues}
          multiple={multiple}
          disableFacets={disableFacets}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DataTableFacetedFilter