import { addNextContact } from "@/api/fourProp"
import ColumnNextContact from "@/routes/-ui/ColumnNextContact"
import useContactDateMutationOptions from "./use-ContactDateEachMutationOptions"

const ColumnNextContactEach = ({
    id, 
    tableDataQueryKey = null,
    placeholder = "Pick a date",
    name = "next_contact",
    table = null,
    defaultValue = null,
    onSuccess, 
    message,
}) => {
    const mutationOptions = useContactDateMutationOptions({
        id,
        tableDataQueryKey,
        mutationFn: addNextContact,
        onSuccess,
    })

    return (
        <ColumnNextContact
            name={name}
            id={id}
            table={table}
            defaultValue={defaultValue}
            message={message}
            placeholder={placeholder}
            mutationOptions={mutationOptions}
        />
    )
}

export default ColumnNextContactEach
