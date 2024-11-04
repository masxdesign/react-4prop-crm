import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Link } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
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
import { useEffect, useState } from "react"
import { useCounter } from "@uidotdev/usehooks"

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
    backButton,
    backButtonText = "Back",
    submitText = "Add"
}) {

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
        validateEmailShow,
        validateEmailMessage,
        handleEmailBlur,
        handleEmailFocus,
        isValidating,
        isEmailValid,
        reset: resetValidateEmail
    } = useValidateEmail({ form, pid })

    const onSubmit = async values => {
        const { saved } =  await importList.mutateAsync([values])
        form.reset()
        resetValidateEmail()
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
                          <FormItem className="space-y-2">
                              <FormLabel className="text-sm font-bold">Email*</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input {...field} onBlur={handleEmailBlur} onFocus={handleEmailFocus} />
                                  <div className="absolute right-0 top-0 bottom-0 flex">
                                    <div className="m-1 text-sky-500 bg-slate-100 hover:bg-sky-100 cursor-pointer flex px-3 rounded-md">
                                        <Slot className="w-4 h-4 m-auto">
                                            {isValidating ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <ScanSearchIcon />
                                            )}
                                        </Slot>
                                    </div>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                              {isValidating ? (
                                <div className="px-2 italic text-xs text-muted-foreground">
                                    Checking availability...
                                </div>
                              ) : validateEmailShow ? (
                                  <HoverOverlayWarningText {...validateEmailMessage} />
                              ) : !form.formState.errors.email && (
                                <div className="text-xs text-muted-foreground">
                                    First {emailErrorMessage} to check availability
                                </div>
                              )}
                          </FormItem>
                        )}
                    />

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
                                    disabled={!isEmailValid}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <Input placeholder="Last name" {...form.register("last")} disabled={!isEmailValid} />

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Company</label>
                        <Input {...form.register("company")} disabled={!isEmailValid} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold">Phone</label>
                        <Input {...form.register("phone")} disabled={!isEmailValid} />
                    </div>

                    <div className="flex justify-end gap-3">
                        {backButton && (
                            <Button variant="outline" asChild>
                                <Link to="..">
                                    {backButtonText}
                                </Link>
                            </Button>
                        )}
                        <Button type="submit" disabled={!isEmailValid}>
                            {submitText}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    )
}

const initialValidateEmailMessage = null
const initialValidateEmailShow = false
const initialValidateEmail = ""

export function useValidateEmail ({ form, pid = null }) {

    const [validateEmailMessage, setValidateEmailMessage] = useState(initialValidateEmailMessage)
    const [validateEmailShow, setValidateEmailShow] = useState(initialValidateEmailShow)
    const [validateEmail, setValidateEmail] = useState(initialValidateEmail)

    const [blurCountValue, blurCount] = useCounter(0)

    const validateEmailQuery = useValidateEmailQuery(validateEmail, pid)

    const reset = () => {
        setValidateEmailMessage(initialValidateEmailMessage)
        setValidateEmailShow(initialValidateEmailShow)
        setValidateEmail(initialValidateEmail)
        blurCount.reset()
    }

    useEffect(() => {

        const { isFetched, data } = validateEmailQuery

        if (isFetched) {

            const make = variant => text => {
                setValidateEmailMessage({ text, variant })
            }

            const isWarning = make("warning")
            const isSuccess = make("success")

            switch (true) {
                case data.already_sent && data.in_list:
                    isWarning("You shared this property already to this contact.")
                    break
                case data.already_sent:
                    isWarning("Another agency shared this property to this contact")
                    break
                case data.in_list:
                    isWarning("This email is already is in used in your contacts")
                    break
                default:
                    isSuccess("Email available")
            }

        }

    }, [validateEmailQuery.data])

    const handleEmailBlur = () => {

        try {

            form.clearErrors("email")

            const email = form.getValues("email")

            schemaEmail.validateSync(email)
        
            setValidateEmail(email)
            setValidateEmailShow(true)

        } catch (e) {

            if (blurCountValue < 1) return
    
            form.setError("email", e)

        } finally {

            blurCount.increment()

        }
        
    }

    useEffect(() => {

        handleEmailBlur()

    }, [])

    const handleEmailFocus = () => {
        setValidateEmailShow(false)
    }

    return {
        validateEmailMessage,
        validateEmailShow,
        handleEmailFocus,
        handleEmailBlur,
        isValidating: validateEmailQuery.isFetching,
        isEmailValid: validateEmailMessage?.variant === "success" && !form.formState.errors?.email,
        reset
    }

}

export default ImportSingleContactForm