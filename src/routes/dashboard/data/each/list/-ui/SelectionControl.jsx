import { createContext, useContext } from "react";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CheckIcon } from "@radix-ui/react-icons";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import UserCard from "./UserCard";

const SelectionControlContext = createContext(null)

export const useSelectionControlContext = () =>
    useContext(SelectionControlContext)

function SelectionControl({
    selected,
    selection,
    open,
    excluded,
    onOpenChange,
    onItemCheckedChange,
    onSelectAll,
    onDeselectAll,
    onItemView,
    children
}) {

    return (
        <SelectionControlContext.Provider
            value={{
                selected,
                selection,
                open,
                excluded,
                onOpenChange,
                onItemCheckedChange,
                onSelectAll,
                onDeselectAll,
                onItemView
            }}
        >
            <Popover open={open} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                        <CheckIcon className={cn("h-4 w-4")} />
                        {selected.length > 0 && (
                            <>
                                <Separator orientation="vertical" className="mx-2 h-4" />
                                <Badge
                                    variant="secondary"
                                    className="rounded-sm px-1 font-normal"
                                >
                                    {selected.length} selected
                                </Badge>
                            </>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={`w-80 p-0`} align="start">
                    {children}
                </PopoverContent>
            </Popover>
        </SelectionControlContext.Provider>
    )
}

SelectionControl.HeaderAndContent = () => {
    const { selection, onItemCheckedChange, onItemView, onDeselectAll, onSelectAll, selected, excluded  } = useSelectionControlContext()

    return (
        <>
            <div className="py-1.5 px-2 flex items-center justify-end gap-2">
                <Button
                    variant="secondary"
                    size="xs"
                    onClick={onDeselectAll}
                    disabled={selected.length < 1}
                >
                    Deselect all
                </Button>
                <Button
                    variant="secondary"
                    size="xs"
                    onClick={onSelectAll}
                    disabled={excluded.length < 1}
                >
                    Select all
                </Button>
            </div>
            <Separator />
            <div className="overflow-y-auto max-h-96">
                {selection.map((item) => (
                    <div
                        className={cn("flex flex-row gap-1 items-baseline", {
                            "line-through opacity-50": excluded.includes(item.id),
                        })}
                        key={item.id}
                    >
                        <div className="w-2" />
                        <Checkbox
                            checked={!excluded.includes(item.id)}
                            onCheckedChange={(checked) =>
                                onItemCheckedChange(item.id, checked)
                            }
                            aria-label="Select row"
                            className="translate-y-[5px]"
                        />
                        <UserCard
                            data={item}
                            className="w-full p-3 hover:bg-muted/50 cursor-pointer"
                            onView={() => onItemView(item)}
                            hideView={excluded.includes(item.id)}
                            hideContact
                        />
                    </div>
                ))}
            </div>
        </>
    )
}

SelectionControl.Footer = ({ children }) => (
    <>
        <Separator />
        <div className="py-1.5 px-2 flex gap-2 items-center justify-center">
            {children}
        </div>
    </>
)

export default SelectionControl