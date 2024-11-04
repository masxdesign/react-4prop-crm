import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Link } from "@tanstack/react-router"
import { useForm, useWatch } from "react-hook-form"
import { Slot } from "@radix-ui/react-slot"
import { Loader2, ScanSearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import HoverOverlayWarningText from "@/components/HoverOverlayWarningText"
import useImportList from "@/hooks/useImportList"
import useValidateEmailQuery from "@/hooks/useValidateEmailQuery"
import { useEffect, useMemo, useState } from "react"
import { useCounter, useDebounce } from "@uidotdev/usehooks"
import { useGradeShareContext, useGradeShareFilterByEmailQuery } from "@/routes/_auth.grade._gradeWidget/$pid_.share"
import Selection from "../Selection"

const emailErrorMessage = "Enter a valid email"
const schemaEmail = yup.string().email(emailErrorMessage).required()

const schema = yup.object({
    first: yup.string().required(),
    email: schemaEmail
})

function ImportSingleContactForm ({ 
    pid = null, 
    defaultEmail = "", 
    onSubmit: onSubmitProp,
    submitText = "Add"
}) {

    const { onConfirm } = useGradeShareContext()

    const form = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            first: "",
            last: "",
            company: "",
            email: defaultEmail,
            phone: "",
        },
    })

    const importList = useImportList()

    const {
        validateStatus,
        isValidating,
        suggestionsQuery
    } = useValidateEmail({ form, pid })

    const onSubmit = async values => {
        const { saved } =  await importList.mutateAsync([values])
        form.reset()
        onSubmitProp({ id: saved[0], ...values })
    }

    return (
        <div className="flex flex-col gap-6">
            <Form {...form}>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                  
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-2 sticky top-3 left-0 z-20">
                              <FormControl>
                                <div className="relative">
                                    <Input placeholder="Email address" {...field} />
                                    {isValidating && (
                                        <Loader2 className="absolute top-3 right-3 animate-spin w-4 h-4" />
                                    )}
                                </div>
                              </FormControl>
                          </FormItem>
                        )}
                    />

                    {isValidating ? (
                        <div className="px-2 italic text-xs text-muted-foreground">
                            Checking availability...
                        </div>
                    ) : (
                        <HoverOverlayWarningText {...validateStatus} />
                    )}

                    {suggestionsQuery.data.length > 0 && (
                        <div className='space-y-2'>
                            {suggestionsQuery.data.map(item => (
                                <Selection
                                    key={item.id} 
                                    onClick={() => onConfirm(item)}
                                    disabled={item.can_send === 0}
                                    hoverOverlayText={
                                        item.can_send === 0 &&
                                            <HoverOverlayWarningText 
                                                text="You or another agency shared this property already" 
                                            />
                                    }
                                >
                                    {item.email}
                                </Selection>
                            ))}
                        </div>
                    )}

                    {validateStatus?.variant === "success" && (
                        <>
                            <FormField
                                control={form.control}
                                name="first"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold">Full name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="First name*"
                                            {...field}
                                        
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <Input placeholder="Last name" {...form.register("last")} />

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Company</label>
                                <Input {...form.register("company")} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold">Phone</label>
                                <Input {...form.register("phone")} />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit">
                                    {submitText}
                                </Button>
                            </div>
                        </>
                    )}

                </form>
            </Form>
        </div>
    )
}

export function useValidateEmail ({ form, pid = null }) {

    const email = useWatch({ control: form.control, name: 'email' })

    const debounceEmail = useDebounce(email, 500)

    const validateEmailQuery = useValidateEmailQuery(debounceEmail, pid)

    const validateStatus = useMemo(() => {

        const { isFetched, data, isFetching } = validateEmailQuery

        if (isFetching) {
            return { text: 'Checking...', variant: 'checking' }
        }

        if (isFetched) {

            const make = variant => text => {
                return { text, variant }
            }

            const isSuccess = make("success")
            const isUnavailable = make("unavailable")
            const isInvalid = make("invalid")

            switch (true) {
                case data === null:
                    return isInvalid("This email is required")
                case data.already_sent && data.in_list:
                    return isUnavailable("You shared this property already to this contact")
                case data.already_sent:
                    return isUnavailable("Another agency shared this property to this contact")
                case data.in_list:
                    return isUnavailable("This email is in your contacts")
                case data.invalid:
                    return isInvalid(data.error.type)
                default:
                    return isSuccess("Email available")
            }

        }

        return { variant: 'initial', text: 'Please type a valid email' }

    }, [validateEmailQuery.isFetching, validateEmailQuery.data])

    const suggestionsQuery = useGradeShareFilterByEmailQuery(
        debounceEmail, 
        ["invalid", "unavailable"].includes(validateStatus.variant)
    )

    const validateStatusModified = useMemo(() => {

        if (validateStatus.variant === 'invalid') {

            const hasSuggestions = suggestionsQuery.data?.length > 0

            if (validateStatus.text === 'email') {

                return {
                    ...validateStatus,
                    text: `Enter a valid email to add ${hasSuggestions ? 'or select from the list': ''}`
                }

            }

            if (validateStatus.text === 'required') {

                return {
                    ...validateStatus,
                    text: `Enter a valid email to add or search in your contacts`
                }

            }

        }

        return validateStatus

    }, [suggestionsQuery.data?.length, validateStatus])

    return {
        validateStatus: validateStatusModified,
        suggestionsQuery,
        isValidating: validateEmailQuery.isFetching
    }

}

export default ImportSingleContactForm