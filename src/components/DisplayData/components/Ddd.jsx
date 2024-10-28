import { forwardRef, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { isEmpty, isNumber, isString } from "lodash"
import { ArrowRightIcon, CheckIcon, Copy, Loader2, Pencil } from "lucide-react"
import htmlEntities from "@/utils/htmlEntities"
import myDateTimeFormat from "@/utils/myDateTimeFormat"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useMutation } from "@tanstack/react-query"
import delay from "@/utils/delay"
import Dd from "./Dd"
import { Badge } from "@/components/ui/badge"

const CopyButton = ({ value, onCopied }) => {
    const [success, setSuccess] = useState(false)
    
    const handleCopyText = async () => {
        navigator.clipboard.writeText(value)
        setSuccess(true)
        onCopied()
        await delay(500)
        setSuccess(false)
    }

    return (
        <Button
            variant="link"
            size="xs"
            className="group-hover:opacity-40 group-hover:hover:opacity-100"
            onClick={handleCopyText}
        >
            {success ? (
                <CheckIcon className="text-green-500 w-3 h-3" />
            ) : (
                <Copy className="w-3 h-3" />
            )}
        </Button>
    )
}

const EditableInput = ({ defaultValue, onReadmode, updateMutationOptions, name, label }) => {
    const { toast } = useToast()

    const inputRef = useRef()
    const [value, setValue] = useState(defaultValue)

    const updateMutation = useMutation(updateMutationOptions)

    const handleChange = (e) => {
      setValue(e.target.value)
    }

    const handleSave = useCallback(async () => {
        try {
    
            if (defaultValue !== value) {

                const newValue = value.trim()

                await updateMutation.mutateAsync({ name, newValue })

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

    }, [value, updateMutation])

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSave()
        }
    }

    useLayoutEffect(() => {
        inputRef.current.focus()
    }, [])

    return (
        <div className="flex items-center">
            <Input
                ref={inputRef}
                value={value}
                onBlur={handleSave}
                onKeyPress={handleKeyPress}
                onChange={handleChange}
                disabled={updateMutation.isPending}
                className="h-[20px] border-l-0 border-r-0 border-t-0 border-b rounded-none px-0 focus-visible:ring-0"
            />
            <Button
                variant="link"
                size="xs"
                className="opacity-50 hover:opacity-100"
                disabled={updateMutation.isPending}
                onClick={handleSave}
            >
                {updateMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <ArrowRightIcon className="w-3 h-3" />
                )}
            </Button>
        </div>
    )
}

const Editable = ({ isDate, value, name, label, updateMutationOptions, editable, copiable = true }) => {
    const { toast } = useToast()

    const [editmode, setEditmode] = useState(false)

    const renderDisplay = () => {
        return isDate ? 
            myDateTimeFormat(value)
        : isNumber(value) ?
            <span>{value}</span>
        : isEmpty(value) ? 
            <i className="opacity-50">(empty)</i>
        : "email" === name ?
            <a
                href={`mailto: ${value}`}
                className="hover:underline"
            >
                {value}
            </a>
        : ["phone", "mobile"].includes(name) ? 
            <a
                href={`tel: ${value}`}
                className="hover:underline"
            >
                {value}
            </a>
        : "website" === name ? 
            <a
                href={`https://www.${value}`}
                target="__blank"
                className="hover:underline"
            >
                {value}
            </a>
        : 
            value
    }

    const handleEditmode = () => {
        setEditmode(true)
    }

    const handleReadmode = () => {
        setEditmode(false)
    }

    const handleCopied = () => {
        toast({
            title: "Copied!",
            description: `${value}`,
        })
    }

    if (editable && !updateMutationOptions) throw new Error('updateMutationOptions is not defined')

    return editmode ? (
        <EditableInput 
          defaultValue={value} 
          updateMutationOptions={updateMutationOptions}
          name={name}
          label={label}
          onReadmode={handleReadmode}
        />
    ) : (
        <div className="flex gap-0 items-center group h-[28px]">
            <div className="grow group-hover:overflow-hidden truncate h-[20px]">
                {renderDisplay()}
            </div>            
            <div className="group-hover:flex hidden shrink">
                {editable && (
                  <Button
                      variant="link"
                      size="xs"
                      className="group-hover:opacity-40 group-hover:hover:opacity-100"
                      onClick={handleEditmode}
                  >
                      <Pencil className="w-3 h-3" />
                  </Button>
                )}
                {copiable && (
                    <CopyButton value={value} onCopied={handleCopied} />
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
            copiable,
            updateMutationOptions,
            isDate,
            ...props
        },
        ref
    ) => {
        const valueRaw = row[name]

        const value = useMemo(() => (
            names ?
                names[valueRaw]
            : isString(valueRaw) ? 
                htmlEntities(valueRaw) 
            : 
                valueRaw
        ), [valueRaw, names])

        if (!alwaysShow && isEmpty(value)) return null

        return (
            <Dd
                ref={ref}
                bold={bold}
                label={label}
                labelClassName={labelClassName}
                collapsible={collapsible}
                value={
                    <Editable
                        name={name}
                        label={label}
                        value={value}
                        isDate={isDate}
                        editable={editable}
                        copiable={copiable}
                        updateMutationOptions={updateMutationOptions}
                    />
                    }
                {...props}
            />
        )
    }
)

export default Ddd
