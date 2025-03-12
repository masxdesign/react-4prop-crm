import * as yup from "yup"
import { ArrowRight, Check } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { yupResolver } from "@hookform/resolvers/yup"
import { useUppyState } from "@uppy/react"
import Uppy from "@uppy/core"
import { useMemo, useState } from "react"
import { BizchatAttachmentsButton } from "@/components/Uppy/components"
import { filesSelector } from "@/hooks/use-Chatbox"
import { produce } from "immer"

const validationSchema = yup.object({
    message: yup.string().when(["files", "choices"], {
        is: (files, choices) => files.length < 1 && choices.length < 1,
        then: (schema) => schema.required()
    })
})

const initialChoices = []

const WriteYourReplyHereInputForm = ({ disableChoices, onSubmit, choicesDisableOptions, placeholder = "Write your reply here..." }) => {
    const [uppy] = useState(() => new Uppy({
        restrictions: {
          maxNumberOfFiles: 3,
          allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
          maxFileSize: 15_000_000
        }
    }))

    const files = useUppyState(uppy, filesSelector)

    const form = useForm({ 
        values: {
            message: "",
            files,
            choices: initialChoices
        },
        resolver: yupResolver(validationSchema)
    })

    const onValid = async (values) => {
        const { choices, ...values_ } = values 

        const defaultChoices = {
            pdf: false,
            viewing: false
        }
        const l = ['pdf', 'viewing']
        const selectedChoices = Object.fromEntries(choices.map(row => ([l[row], true])))

        await onSubmit({
            ...values_,
            choices: {
                ...defaultChoices,
                ...selectedChoices
            }
        })

        form.reset()
        uppy.clear()
    }
    
    return (
        <div className="space-y-2">
            {!disableChoices && (
                <Controller
                    name="choices"
                    control={form.control}
                    render={({ field }) => (
                        <Choices 
                            disableOptions={choicesDisableOptions} 
                            checked={field.value} 
                            onSelect={field.onChange} 
                        />
                    )}
                />
            )}
            <div className='flex gap-2 items-center transition-all opacity-80 hover:opacity-100 focus-within:opacity-100 bg-white rounded-lg px-[3px]'>
                <Textarea 
                    placeholder={placeholder}
                    className={cn(
                        "resize-none border-none min-h-0 h-9 bg-transparent"
                    )}
                    {...form.register("message")}
                /> 
                <div className="flex items-center gap-1">
                    <BizchatAttachmentsButton uppy={uppy} className="h-8" />
                    <button 
                        onClick={form.handleSubmit(onValid)}
                        className='flex items-center justify-center p-1 bg-primary rounded-lg size-8'
                    >
                        <ArrowRight className='size-4 text-primary-foreground' />
                    </button>
                </div>
            </div>
        </div>
    )
}

const choiceItems = [
    { value: 0, label: 'Request for information', id: 2 },
    { value: 1, label: 'Request a viewing', id: 1 },
]

const Choices = ({ disableOptions, checked, onSelect }) => {

    const filtered = useMemo(() => {
        if (isNaN(disableOptions)) return choiceItems

        return choiceItems.filter(row => {
            return (disableOptions & row.id) === 0
        })
    }, [disableOptions])

    const handleCheck = (value) => {
        const newState = produce(checked, (draft) => {
            const i = draft.indexOf(value)
            if (i === -1) {
                draft.push(value)
            } else {
                draft.splice(i, 1)
            }
        })
        onSelect(newState)
    }
    
    return (
        <ul className='flex gap-2'>
            {filtered.map((item) => (
                <ChoiceCheckbox 
                    key={item.value}
                    label={item.label}
                    checked={checked.indexOf(item.value) > -1}
                    onClick={() => handleCheck(item.value)}
                /> 
            ))}
        </ul>
    )
}

const ChoiceCheckbox = ({ label, checked, ...props }) => {
    return (
        <li 
            className='flex gap-2 items-center cursor-pointer py-1 border border-white rounded-md px-2 text-xs text-white'
            {...props}
        >
            {checked ? (
                <Check className="size-3" strokeWidth={4} />
            ) : (
                <span className="border border-white size-3 rounded-sm opacity-70"></span>
            )}
            <span>
                {label}
            </span>
        </li>
    )
}

export default WriteYourReplyHereInputForm