import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react"
import { isEmpty, isString } from "lodash"
import htmlEntities from "@/utils/htmlEntities"
import myDateTimeFormat from "@/utils/myDateTimeFormat"
import Dd from "./Dd"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy, Pencil, RefreshCcw, SaveIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "@tanstack/react-query"

const EditableInput = ({ defaultValue, onReadmode, updateMutationOptions, name, label }) => {
    const { toast } = useToast()

    const inputRef = useRef()
    const [value, setValue] = useState(defaultValue)

    const updateMutation = useMutation(updateMutationOptions)

    const handleChange = (e) => {
      setValue(e.target.value)
    }

    const handleSave = async () => {
      try {

        if (defaultValue !== value) {

          await updateMutation.mutateAsync({ name, newValue: value })

          toast({
            title: `${label} has been updated!`,
          })

        }

      } catch (e) {

        toast({
          title: `Something went wrong when updating ${label}`,
          description: e.message
        })
        
      } finally {
        onReadmode()
      }
    }

    useLayoutEffect(() => {
        inputRef.current.focus()
    }, [])

    useLayoutEffect(() => {
        inputRef.current.addEventListener("blur", handleSave)

        return () => {
            inputRef.current.removeEventListener("blur", handleSave)
        }
    }, [value])

    return (
        <div className="flex gap-3 items-center">
            <Input
                ref={inputRef}
                value={value}
                onChange={handleChange}
                className="border-l-0 border-r-0 border-t-0 rounded-none h-3 px-0 focus-visible:ring-0"
            />
            <Button
                variant="link"
                size="xs"
                className="opacity-50 hover:opacity-100"
                onClick={handleSave}
            >
                <SaveIcon className="w-3 h-3" />
            </Button>
        </div>
    )
}

const Editable = ({ display, value, name, label, updateMutationOptions, editable }) => {
    const { toast } = useToast()

    const [editmode, setEditmode] = useState(false)

    const handleEditmode = () => {
        setEditmode(true)
    }

    const handleReadmode = () => {
        setEditmode(false)
    }

    const handleCopyText = () => {
        navigator.clipboard.writeText(value)
        toast({
            title: "Copied!",
            description: `${value}`,
        })
    }

    const yesEnableEditmode = editable && updateMutationOptions

    return editmode ? (
        <EditableInput 
          defaultValue={value} 
          updateMutationOptions={updateMutationOptions}
          name={name}
          label={label}
          onReadmode={handleReadmode}
        />
    ) : (
        <div className="flex gap-3 items-center group">
            <div className="group-hover:w-2/3 group-hover:overflow-hidden group-hover:truncate">
                {display}
            </div>            
            <div className="flex shrink basis-1/3">
                <Button
                    variant="link"
                    size="xs"
                    className="opacity-0 group-hover:opacity-40 group-hover:hover:opacity-100"
                    onClick={handleCopyText}
                >
                    <Copy className="w-3 h-3" />
                </Button>
                {yesEnableEditmode && (
                  <Button
                      variant="link"
                      size="xs"
                      className="opacity-0 group-hover:opacity-40 group-hover:hover:opacity-100"
                      onClick={handleEditmode}
                  >
                      <Pencil className="w-3 h-3" />
                  </Button>
                )}
            </div>
        </div>
    )
}

const Ddd = forwardRef(
    (
        {
            label,
            row,
            name,
            names,
            bold,
            labelClassName,
            alwaysShow,
            collapsible,
            editable,
            updateMutationOptions,
            isDate,
            ...props
        },
        ref
    ) => {
        const valueRaw = row[name]
        const value = useMemo(() => {
            if (names) return names[valueRaw]

            return isString(valueRaw) ? htmlEntities(valueRaw) : valueRaw
        }, [valueRaw, names])

        if (!alwaysShow && isEmpty(value)) return null

        return (
            <Dd
                ref={ref}
                bold={bold}
                label={label}
                labelClassName={labelClassName}
                collapsible={collapsible}
                value={
                    isDate ? (
                        <>{myDateTimeFormat(value)}</>
                    ) : isEmpty(value) ? (
                      <Editable
                            display={
                              <i className="opacity-50">(empty)</i>
                            }
                            value={value}
                            name={name}
                            label={label}
                            editable={editable}
                            updateMutationOptions={updateMutationOptions}
                        />
                    ) : "email" === name ? (
                        <Editable
                            display={
                                <a
                                    href={`mailto: ${value}`}
                                    className="hover:underline"
                                >
                                    {value}
                                </a>
                            }
                            value={value}
                            name={name}
                            label={label}
                            editable={editable}
                            updateMutationOptions={updateMutationOptions}
                        />
                    ) : ["phone", "mobile"].includes(name) ? (
                        <Editable
                            display={
                                <a
                                    href={`tel: ${value}`}
                                    className="hover:underline"
                                >
                                    {value}
                                </a>
                            }
                            value={value}
                            name={name}
                            label={label}
                            editable={editable}
                            updateMutationOptions={updateMutationOptions}
                        />
                    ) : "website" === name ? (
                        <Editable
                            display={
                                <a
                                    href={`https://www.${value}`}
                                    target="__blank"
                                    className="hover:underline"
                                >
                                    {value}
                                </a>
                            }
                            value={value}
                            name={name}
                            label={label}
                            editable={editable}
                            updateMutationOptions={updateMutationOptions}
                        />
                    ) : (
                        <Editable 
                          display={value} 
                          value={value} 
                          name={name}
                          label={label}
                          editable={editable}
                          updateMutationOptions={updateMutationOptions}  
                        />
                    )
                }
                {...props}
            />
        )
    }
)

export default Ddd
