import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"

const UIFormFieldLabel = ({ form, name, label, inputType, placeholder, description, ...props }) => (
    <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
            <FormItem {...props}>
                <FormLabel className="sr-only">{label}</FormLabel>
                <FormControl>
                    <Input type={inputType} placeholder={placeholder} {...field} />
                </FormControl>
                {description && (
                    <FormDescription>
                        {description}
                    </FormDescription>
                )}
                <FormMessage />
            </FormItem>
        )}
    />
)

export default UIFormFieldLabel