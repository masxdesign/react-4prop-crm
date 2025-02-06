import * as yup from "yup"
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { yupResolver } from "@hookform/resolvers/yup"
import { useUppyState } from "@uppy/react"
import Uppy from "@uppy/core"
import { useState } from "react"
import { BizchatAttachmentsButton } from "@/components/Uppy/components"
import { filesSelector } from "@/hooks/use-Chatbox"

const validationSchema = yup.object({
    message: yup.string().when("files", {
        is: (value) => value.length < 1,
        then: (schema) => schema.required()
    })
})

const WriteYourReplyHereInputForm = ({ onSubmit, placeholder = "Write your reply here..." }) => {
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
            files
        },
        resolver: yupResolver(validationSchema)
    })

    const onValid = async (values) => {
        await onSubmit(values)
        form.reset()
        uppy.clear()
    }
    
    return (
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
    )
}

export default WriteYourReplyHereInputForm