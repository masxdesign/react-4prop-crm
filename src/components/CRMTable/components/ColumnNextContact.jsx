import { useState } from "react"
import NextContact from "./NextContact"
import { useMutation } from "@tanstack/react-query"
import UpdateValueWhenTableChanges from "./UpdateValueWhenTableChanges"

const ColumnNextContact = ({
    placeholder = "Pick a date",
    id,
    name = "next_contact",
    defaultValue,
    table = null,
    mutationOptions,
    message = "",
}) => {
    const [open, setOpen] = useState(false)

    const [value, setValue] = useState(defaultValue)

    const mutation = useMutation(mutationOptions)

    const handleSelect = (dateValue) => {
        mutation.mutate({ [name]: dateValue, message })
        setValue(dateValue)
        setOpen(false)
    }

    const handleClear = (e) => {
        e.preventDefault()
        mutation.mutate({ [name]: null, message })
        setValue(null)
        setOpen(false)
    }

    if (mutation.isPending)
        return (
            <small className="text-muted-foreground flex items-center h-[40px]">
                Saving...
            </small>
        )

    return (
      <>
        {table && (
            <UpdateValueWhenTableChanges
              id={id}
              table={table}
              name={name}
              onChange={setValue}
            />
        )}
        <NextContact
            open={open}
            value={value}
            placeholder={placeholder}
            onSelect={handleSelect}
            onClear={handleClear}
            onOpenChange={setOpen}
        />
      </>
    )
}

export default ColumnNextContact
