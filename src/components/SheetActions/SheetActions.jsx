import { Button } from "@/components/ui/button"
import * as Yup from "yup"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useToast } from "../ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import categoriesQueryOptions from "@/api/categoriesQueryOptions"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { updateClient } from "@/api/api-fakeServer"
import { isMatch } from "lodash"

const schema = Yup.object().shape({
    title: Yup.string().required(),
    first: Yup.string().required(),
    last: Yup.string().required(),
    email: Yup.string().required(),
})

const EditForm = ({ info, tab, onSelect, onSubmit }) => {

    const query = useSuspenseQuery(categoriesQueryOptions) 
    const categories = query.data

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (data) => updateClient({ id: data.id }, data)
    })

    const form = useForm({
        resolver: yupResolver(schema),
        defaultValues: info.row.original
    })

    const handleSubmit = async (data) => {
        await mutation.mutateAsync(data)
        
        queryClient.setQueryData(['clients'], (old) => old.map((item) => {
            if(!isMatch(item, { id: data.id })) return item
            return { ...item, ...data }
        }))

        onSubmit(data)
    }

    const handleValueChange = (tab) => {
        onSelect(tab)
        form.reset()
    }

    const submitButton = (
        <div className="flex justify-end">
            <Button type="submit" disabled={!form.formState.isDirty || mutation.isPending}>
                {mutation.isPending ? (
                    'Saving...'
                ) : (
                    'Save'
                )}    
            </Button>  
        </div>
    )

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <Accordion type="single" value={tab} onValueChange={handleValueChange} collapsible>
                    <AccordionItem value="person">
                        <AccordionTrigger>
                            Personal details
                        </AccordionTrigger>
                        <AccordionContent className="px-1 space-y-8">
                            <FormField
                                control={form.control}
                                name="company"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your company" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salutation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="first"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your first name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your last name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {submitButton}      
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="contact">
                        <AccordionTrigger>
                            Contact
                        </AccordionTrigger>
                        <AccordionContent className="px-1 space-y-8">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />     
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your phone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />     
                            {submitButton}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="address">
                        <AccordionTrigger>
                            Address
                        </AccordionTrigger>
                        <AccordionContent className="px-1 space-y-8">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your city" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="postcode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Postcode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your postcode" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />      
                            {submitButton}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="categories">
                        <AccordionTrigger>
                            Categories
                        </AccordionTrigger>
                        <AccordionContent className="px-1 space-y-8">
                            <FormField
                                control={form.control}
                                name="categories"
                                render={() => (
                                    <FormItem>
                                        {categories.map((item) => (
                                            <FormField
                                                key={item.value}
                                                control={form.control}
                                                name="categories"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                        key={item.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                        <FormControl>
                                                            <Checkbox
                                                            checked={field.value?.includes(item.value)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                ? field.onChange([...field.value, item.value])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                        (value) => value !== item.value
                                                                    )
                                                                    )
                                                            }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {item.label}
                                                        </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {submitButton}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </form>
        </Form>
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