import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateClient } from "@/api/api-fakeServer"
import Form from "../../../../../../components/Form/Form"
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../../../../../components/ui/accordion"
import Clientform from "./Clientform"
import { useToast } from "../../../../../../components/ui/use-toast"
import { util_pagin_update } from "@/utils/localStorageController"

const ClientFormEdit = ({ info, tab, onSelect, onSubmit }) => {
    const queryClient = useQueryClient()

    const { toast } = useToast()

    const { dataQueryKey } = info.table.options.meta

    const defaultValues = info.row.original
    const focusOn = info.column.id

    const mutation = useMutation({
        mutationFn: (data) => updateClient({ id: data.id }, data)
    })

    const handleSubmit = async (data) => {
        try {
            await mutation.mutateAsync(data)
            queryClient.setQueryData(dataQueryKey, util_pagin_update({ id: data.id }, data))
            toast({
                title: "Successfully updated",
                description: `${info.row.getValue('fullName')}`,
            })
            onSubmit(data)
        } catch (e) {
            console.log(e);
        }
    }

    const submitButton = (
        <div className="flex justify-end">
            <Form.Submit disabled={mutation.isPending}>
                {mutation.isPending ? (
                    'Saving...'
                ) : (
                    'Save'
                )}
            </Form.Submit> 
        </div>
    )

    return (
        <Clientform 
            focusOn={focusOn} 
            defaultValues={defaultValues} 
            onSubmit={handleSubmit} 
            className="space-y-8"
        >
            <Form.Accordion 
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
            </Form.Accordion>
        </Clientform>
    )
}

export default ClientFormEdit