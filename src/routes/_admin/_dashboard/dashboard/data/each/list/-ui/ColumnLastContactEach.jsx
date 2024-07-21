import { addLastContact } from "@/api/fourProp"
import ColumnLastContact from "@/routes/-ui/ColumnLastContact"
import useContactDateEachMutationOptions from "./use-ContactDateEachMutationOptions"
import { useAuth } from "@/components/Auth/Auth-context"

const ColumnLastContactEach = ({
    variant,
    id,
    tableDataQueryKey,
    name = "last_contact",
    defaultValue,
    table = null,
    onSuccess,
    message,
}) => {
    const auth = useAuth()
    const mutationOptions = useContactDateEachMutationOptions({
        id,
        tableDataQueryKey,
        mutationFn: addLastContact,
        onSuccess,
    })

    if (auth.user?.neg_id === id) return null

    return (
      <ColumnLastContact
          variant={variant}
          id={id}
          name={name}
          defaultValue={defaultValue}
          message={message}
          table={table}
          mutationOptions={mutationOptions}
      />
    )
}

export default ColumnLastContactEach
