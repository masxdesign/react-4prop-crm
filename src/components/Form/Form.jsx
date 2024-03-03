import { Suspense, useLayoutEffect, useRef } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useForm, useFormContext } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Form as UIForm, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Accordion } from "../ui/accordion"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"

const Form = ({ schema, children, defaultValues, focusOn, onSubmit, ...props }) => {
    const formRef = useRef(null)

    const form = useForm({
        resolver: yupResolver(schema),
        defaultValues
    })

    useLayoutEffect(() => {
        if(focusOn) {
            formRef.current.querySelector(`input[name="${focusOn}"]`)?.focus()
        }
    }, [focusOn])

    return (
        <UIForm {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} {...props}>
                {children}
            </form>
        </UIForm>
    )
}

const Field = Form.Field = ({ label, name, ...props }) => {
    const form = useFormContext()

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Input {...props} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

const SingleCheckbox = ({ form, name, label, value }) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
            return (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                        <Checkbox
                            checked={field.value?.includes(value)}
                            onCheckedChange={(checked) => {
                                return checked
                                ? field.onChange([...field.value, value])
                                : field.onChange(
                                    field.value?.filter(
                                        (fieldValue) => fieldValue !== value
                                    )
                                )
                            }}
                        />
                    </FormControl>
                    <FormLabel className="font-normal">
                        {label}
                    </FormLabel>
                </FormItem>
            )
        }}
    />
)

const FieldCheckboxGroup = Form.fieldCheckboxGroup = ({ name, items }) => {
    const form = useFormContext()
    return (
        <FormField
            control={form.control}
            name={name}
            render={() => (
                <FormItem>
                    {items.map((item) => (
                        <SingleCheckbox 
                            key={item.value} 
                            form={form}
                            name={name} 
                            label={item.label} 
                            value={item.value} 
                        />
                    ))}
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

const FieldCheckboxGroupSuspenseQuery = ({ name, queryOptions }) => {
    const query = useSuspenseQuery(queryOptions) 

    return (
        <FieldCheckboxGroup name={name} items={query.data} />
    )
}

const FieldCheckboxGroupQuery = Form.FieldCheckboxGroupQuery = ({ name, queryOptions }) => (
    <Suspense fallback={<p>Loading...</p>}>
        <FieldCheckboxGroupSuspenseQuery name={name} queryOptions={queryOptions} />
    </Suspense>
)

Form.Accordion = ({ onValueChange, ...props }) => {
    const form = useFormContext()

    const handleValueChange = (...args) => {
        onValueChange(...args)
        form.reset()
    }

    return (
        <Accordion onValueChange={handleValueChange} {...props} />
    )
}

export const formBuilder = ({ schema, groups }) => {
    const Provider = (props) => <Form schema={schema} {...props} />
    const entries = Object.entries(groups).map(
        ([groupName, fields]) => {

            const fields_ = fields.map(({ type, queryOptions, items, ...rest }) => {
                let Component
                switch (type) {
                    case "checkbox":
                        if(queryOptions) {
                            Component = FieldCheckboxGroupQuery
                            break
                        }
                        if(!items) throw new Error('check box component `items` prop missing')
                        Component = FieldCheckboxGroup
                        break
                    default:
                        Component = Field
                }

                return {
                    ...rest,
                    items,
                    queryOptions,
                    Component 
                }
            })

            const Group = ({ header }) => (
                <>
                    {header && <h3 className="mb-4 text-lg font-medium">{header}</h3>}
                    {fields_.map(({ Component, ...props }) => (
                        <Component key={props.name} {...props} />
                    ))} 
                    {header && <Separator className="my-4" />}
                </>
            )

            return [groupName, Group]
        }
    )

    Object.assign(Provider, {
        ...Object.fromEntries(entries),
        All: () => entries.map(([_, Group]) => <Group />)
    })

    return Provider
}

Form.Submit = ({ children, disabled }) => {
    const form = useFormContext()

    return (
        <Button type="submit" disabled={!form.formState.isDirty || disabled}>
            {children}    
        </Button> 
    )
}

export default Form