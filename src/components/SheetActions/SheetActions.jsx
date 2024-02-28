import { useToast } from "../ui/use-toast"
import { Separator } from "../ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { updateClient } from "@/api/api-fakeServer"
import Clientform from "../Clientform"
import { util_pagin_update, util_update } from "@/utils/localStorageController"

const EditForm = ({ info, tab, onSelect, onSubmit }) => {

    const queryClient = useQueryClient()

    const { clientQueryKey } = info.table.options.meta

    const mutation = useMutation({
        mutationFn: (data) => updateClient({ id: data.id }, data)
    })

    const handleSubmit = async (data) => {
        try {

            await mutation.mutateAsync(data)
    
            queryClient.setQueryData(clientQueryKey, util_pagin_update({ id: data.id }, data))
    
            onSubmit(data)

        } catch (e) {

            console.log(e);

        }
    }

    const submitButton = (
        <div className="flex justify-end">
            <Clientform.Submit disabled={mutation.isPending}>
                {mutation.isPending ? (
                    'Saving...'
                ) : (
                    'Save'
                )}
            </Clientform.Submit> 
        </div>
    )

    return (
        <Clientform 
            focusOn={info.column.id} 
            defaultValues={info.row.original} 
            onSubmit={handleSubmit} 
            className="space-y-8"
        >
            <Clientform.Accordion 
                type="single" 
                value={tab} 
                onValueChange={onSelect} 
                collapsible
            >
                <AccordionItem value="person">
                    <AccordionTrigger>
                        Personal details
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.PersonalDetails />                        
                        {submitButton}      
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="contact">
                    <AccordionTrigger>
                        Contact
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.ContactDetails />                        
                        {submitButton}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="address">
                    <AccordionTrigger>
                        Address
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.Address />                        
                        {submitButton}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="categories">
                    <AccordionTrigger>
                        Categories
                    </AccordionTrigger>
                    <AccordionContent className="px-1 space-y-8">
                        <Clientform.Categories />                        
                        {submitButton}
                    </AccordionContent>
                </AccordionItem>
            </Clientform.Accordion>
        </Clientform>
    )
}

const SheetActions = ({ info, open, tab, onOpenChange, onTabValueChange, side = "right" }) => {

    const { toast } = useToast()

    const handleSubmit = () => {
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
                    <EditForm 
                        info={info} 
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