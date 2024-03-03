import { useToast } from "../ui/use-toast"
import { Separator } from "../ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"
import { util_pagin_update } from "@/utils/localStorageController"
import { useQueryClient } from "@tanstack/react-query"
import ClientFormEdit from "../Clientform/ClientFormEdit"

const SheetActions = ({ info, open, tab, onOpenChange, onTabValueChange, side = "right" }) => {
    const { toast } = useToast()

    const queryClient = useQueryClient()

    const handleSubmit = (data) => {
        queryClient.setQueryData(info.table.options.meta.currentQueryOptions.queryKey, util_pagin_update({ id: data.id }, data))
        toast({
            title: "Successfully updated",
            description: `${info.row.getValue('fullName')}`,
        })
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={side} className="w-[375px] sm:w-[800px]">
                <div className="space-y-6">
                    <SheetHeader>
                        <SheetTitle>{info.row.getValue('fullName')}</SheetTitle>
                        <SheetDescription>
                            {info.row.getValue('company')}
                        </SheetDescription>
                    </SheetHeader>
                    <Separator />
                    <ClientFormEdit 
                        defaultValues={info.row.original}
                        focusOn={info.column.id}
                        tab={tab} 
                        onSelect={onTabValueChange} 
                        onSubmit={handleSubmit}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}

  export default SheetActions