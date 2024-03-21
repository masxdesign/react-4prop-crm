import { createContext, useContext } from "react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SelectionControlPopoverContext = createContext(null)

export const useSelectionControlPopoverContext = () =>
    useContext(SelectionControlPopoverContext)

const Trigger = () => (
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
)

const Container = ({ children }) => {
    const { open, onOpenChange } = useSelectionControlPopoverContext()

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <Trigger />
            <PopoverContent className={`w-80 p-0`} align="start">
                {children}
            </PopoverContent>
        </Popover>
    )
}

const Header = () => (
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
    </>
)

const Content = () => (
    <div className="overflow-y-auto max-h-96">
        {selection.map(({ _queryKey: [, , , { pageIndex }], ...item }) => (
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
                    onView={() => {
                        navigate({
                            search: (prev) => ({
                                ...prev,
                                page: pageIndex + 1,
                                open: true,
                                info: item.id,
                            }),
                        })
                    }}
                    hideView={excluded.includes(item.id)}
                    hideContact
                />
            </div>
        ))}
    </div>
)

const Footer = () => (
    <>
        <Separator />
        <div className="py-1.5 px-2 flex gap-2 items-center justify-center">
            <SendBizchatButton variant="link" selected={selected}>
                Send Bizchat to {selected.length} agents
            </SendBizchatButton>
        </div>
    </>
)

export default function SelectionControlPopover({
    navigate,
    selected,
    selection,
    open,
    excluded,
    onOpenChange,
    onItemCheckedChange,
    onSelectAll,
    onDeselectAll,
}) {
    const navigate = useNavigate({ from: "/dashboard/data/each/list" })

    return (
        <SelectionControlPopoverContext.Provider
            value={{
                navigate,
                selected,
                selection,
                open,
                excluded,
                onOpenChange,
                onItemCheckedChange,
                onSelectAll,
                onDeselectAll,
            }}
        >
            {children}
        </SelectionControlPopoverContext.Provider>
    )
}

/**
 *  <Popover open={open} onOpenChange={onOpenChange}>
        <Trigger />
        <PopoverContent className={`w-80 p-0`} align="start">
          <Header />
          
          
        </PopoverContent>
      </Popover>
 */
