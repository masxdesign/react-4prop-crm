import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Check, ChevronsUpDown } from "lucide-react"

const VirtualizedCommand = ({
  height,
  options,
  placeholder,
  selectedOption,
  onSelectOption,
}) => {
    const [filteredOptions, setFilteredOptions] = useState(options)
    const parentRef = useRef(null)

    const virtualizer = useVirtualizer({
        count: filteredOptions.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 35,
        overscan: 5,
    })

    const virtualOptions = virtualizer.getVirtualItems()

    const handleSearch = (search) => {
        setFilteredOptions(
        options.filter((option) =>
            option.value.toLowerCase().includes(search.toLowerCase() ?? [])
        )
        )
    }

    const handleKeyDown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        }
    }

    return (
        <Command shouldFilter={false} onKeyDown={handleKeyDown}>
        <CommandInput onValueChange={handleSearch} placeholder={placeholder} />
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup
            ref={parentRef}
            style={{
            height: height,
            width: "100%",
            overflow: "auto",
            }}
        >
            <div
            style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
            }}
            >
            {virtualOptions.map((virtualOption) => (
                <CommandItem
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualOption.size}px`,
                    transform: `translateY(${virtualOption.start}px)`,
                }}
                key={filteredOptions[virtualOption.index].value}
                value={filteredOptions[virtualOption.index].value}
                onSelect={onSelectOption}
                >
                <Check
                    className={cn(
                    "mr-2 h-4 w-4",
                    selectedOption === filteredOptions[virtualOption.index].value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                />
                {filteredOptions[virtualOption.index].label}
                </CommandItem>
            ))}
            </div>
        </CommandGroup>
        </Command>
    )
}

const VirtualizedCombobox = ({
    options,
    searchPlaceholder = "Search items...",
    width = "400px",
    height = "400px"
}) => {
    const [open, setOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            style={{
                width: width,
            }}
            >
            {selectedOption
                ? options.find((option) => option === selectedOption)
                : searchPlaceholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" style={{ width: width }}>
            <VirtualizedCommand
                height={height}
                options={options.map((option) => ({ value: option, label: option }))}
                placeholder={searchPlaceholder}
                selectedOption={selectedOption}
                onSelectOption={(currentValue) => {
                    setSelectedOption(
                    currentValue === selectedOption ? "" : currentValue
                    )
                    setOpen(false)
                }}
            />
        </PopoverContent>
        </Popover>
    )
}

export default VirtualizedCombobox