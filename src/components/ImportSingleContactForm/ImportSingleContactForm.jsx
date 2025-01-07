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
import { useEffect, useMemo, useRef, useState } from "react"
import { useCounter, useDebounce } from "@uidotdev/usehooks"
import Selection from "../Selection"
import { useLocalStorage } from "@uidotdev/usehooks"
import { uniq, uniqBy } from "lodash"
import { useQuery } from "@tanstack/react-query"
import { filterByEmailQueryOptions } from "@/features/gradeSharing/services"
import { useAuth } from "../Auth/Auth"

const emailErrorMessage = "Enter a valid email"
const schemaEmail = yup.string().email(emailErrorMessage).required()

const schema = yup.object({
    first: yup.string().required(),
    email: schemaEmail
})

function ImportSingleContactForm ({ 
    pid = null, 
    onSelect,
    defaultEmail = "", 
    submitText = "Add"
}) {

    const emailInputRef = useRef()

    useEffect(() => {

        emailInputRef.current.focus()

    }, [])

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

    const email = useWatch({ control: form.control, name: 'email' })

    const importList = useImportList()

    const debounceEmail = useDebounce(email, 500)

    const {
        validateStatus,
        isValidating,
        suggestionsQuery
    } = useValidateEmail({ email: debounceEmail, pid })

    const onSubmit = async values => {
        const { saved } =  await importList.mutateAsync([values])
        form.reset()
        onSelect?.({ id: saved[0], ...values })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)} 
                className='flex flex-col justify-between h-screen'>
                <div className='p-3'>
                    <div className="flex flex-col gap-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem className="space-y-2 sticky top-0 left-0 z-20 bg-white">
                                    {isValidating ? (
                                        <div className="px-2 italic text-xs text-muted-foreground">
                                            Checking availability...
                                        </div>
                                    ) : (
                                        <HoverOverlayWarningText {...validateStatus} />
                                    )}
                                    <FormControl>
                                        <div className="relative">
                                            <Input placeholder="Email address" {...field} ref={emailInputRef} />
                                            {isValidating && (
                                                <Loader2 className="absolute top-3 right-3 animate-spin w-4 h-4" />
                                            )}
                                        </div>
                                    </FormControl>
                            </FormItem>
                            )}
                        />


                        {suggestionsQuery.data.length > 0 && (
                            <div className='space-y-2'>
                                {!debounceEmail && <h3 className="text-sm font-bold">Recent</h3>}
                                {suggestionsQuery.data.map(item => (
                                    <Selection
                                        key={item.id} 
                                        onClick={() => onSelect(item)}
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
                            </>
                        )}
                    </div>
                </div>
                <div className='flex gap-3 justify-center sticky inset-x-0 text-white bg-slate-400 bottom-0 p-3 border-t'>
                    <Button asChild>
                        <Link to="..">
                            Back
                        </Link>
                    </Button>
                    {validateStatus?.variant === "success" && (
                        <Button type="submit">
                            {submitText}
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}

export function useValidateEmail ({ email, pid = null }) {
    const validateEmailQuery = useValidateEmailQuery(email, pid)

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

    const auth = useAuth()

    const suggestionsQuery = useQuery(filterByEmailQueryOptions(
        auth.authUserId,
        email, 
        pid,
        ["invalid", "unavailable"].includes(validateStatus.variant)
    ))

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