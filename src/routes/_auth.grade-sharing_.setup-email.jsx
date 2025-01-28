import GradingWidget from '@/components/GradingWidget'
import PropertyDetail from '@/components/PropertyDetail'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormField } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { usePidGradesMutation } from '@/features/gradeSharing/hooks'
import EnquiryGradingMessagingList from '@/features/messaging/components/EnquiryGradingMessagingList'
import { useGradeSharingInfoSelector, useGradeSharingStore } from '@/hooks/useGradeSharing'
import { getUidByImportId, sendBizchatPropertyEnquiry, sendBizchatPropertyGradeShare } from '@/services/bizchat'
import useListing, { resolveAllPropertiesQuerySelector } from '@/store/use-listing'
import delay from '@/utils/delay'
import { postMessage } from '@/utils/iframeHelpers'
import { createImmer } from '@/utils/zustand-extras'
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { cx } from 'class-variance-authority'
import _, { countBy, find, isEmpty } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import * as yup from "yup"

export const Route = createFileRoute('/_auth/grade-sharing/setup-email')({
  component: SetupEmailComponent
})

const initialSent = []
const initialErrors = {}

const schema = yup.object({
    message: yup.string().required().label("General message")
})

function SetupEmailComponent () {

    const { auth } = Route.useRouteContext()
    const [sent, setSent] = useState(initialSent)
    const [errors, setErrors] = useState(initialErrors)
    
    const { tag, selected, pidGrades } = useGradeSharingInfoSelector()
    const upsertPidGrade = useGradeSharingStore.use.upsertPidGrade()

    const { data } = useSuspenseQuery(useListing(resolveAllPropertiesQuerySelector))  
    
    const graded = useMemo(
        () => pidGrades.filter((item) => item.grade !== 1), 
        [pidGrades]
    )

    // const pidGradesMutation = usePidGradesMutation()

    const sendPropertyEnquiry = useMutation({ 
        mutationFn: ({ uid, pid, grade, message, property }) => {            
            return sendBizchatPropertyGradeShare({ 
                uid, 
                pid, 
                grade, 
                from: auth.bzUserId,
                from_uid: auth.user.id, 
                tag, 
                message,
                property
            })
        } 
    })

    const form = useForm({
        defaultValues: {
            message: "",
            notes: Array(data.length).fill("")
        },
        resolver: yupResolver(schema)
    })

    const controller = useRef()

    const onSubmit = async (values) => {

        let errors_sending = {}

        controller.current = new AbortController()

        const generalMessage = values.message

        const uid = await getUidByImportId(auth.authUserId, selected.id, true)

        try {

            for(const row of graded) {

                const { pid, grade } = row
                const index = graded.indexOf(row)

                if (controller.current.signal.aborted) break

                const specificMessage = values.notes[index] 

                const property = find(data, { id: pid })

                try {

                    await sendPropertyEnquiry.mutateAsync({
                        uid,
                        pid, 
                        grade,
                        message: isEmpty(specificMessage) 
                            ? generalMessage
                            : `${generalMessage}\n\n${specificMessage}`,
                        property
                    })

                } catch (e) {
                    errors_sending = { ...errors_sending, [pid]: e.message }
                    continue
                }

                setSent(prev => [...prev, pid])
                await delay(250)

            }

            postMessage({ type: "GRADE_SHARING_RESET" })

            if (Object.keys(errors_sending).length > 0) {
                setErrors(errors_sending)
                return
            }

            postMessage({ type: "HIDE" })

        } catch (e) {
            console.log(e)
        } finally {
            controller.current = null
        }
        
    }

    const percentage = Math.round(sent.length / graded?.length * 100)

    return (
        <>
            {form.formState.isSubmitting && (
                <div 
                className='fixed inset-0 bg-black/20 flex z-50'>
                    <div className='flex flex-col m-auto bg-white shadow-xl px-8 py-4 rounded-md gap-2'>
                    <strong className='mb-4 text-center'>Sending</strong>
                    <div className='bg-blue-50 w-40 rounded-xl'>
                        <div 
                        className='relative transition-all h-3 flex bg-blue-500 min-w-1 rounded-xl shadow-md' 
                        style={{ width: `${percentage}%` }}
                        >
                        <span className='absolute flex gap-1 flex-nowrap -right-5 -top-5 m-auto drop-shadow-sm'>
                            <span className='text-blue-500 text-xs font-bold'>{sent.length}</span>
                            <span className='text-slate-400 text-xs text-nowrap'>/ {graded?.length}</span> 
                        </span>
                        </div>
                    </div>
                    <div className='text-center text-xs text-slate-400'>Do not close this tab</div>
                        <Button size="xs" onClick={() => controller.current?.abort('cancelled reason')} className="self-center">
                            Pause
                        </Button>
                    </div>
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='p-3'>
                    <label htmlFor="message" className='font-bold text-sm mb-2 block'>
                        General message (required)
                    </label>
                    <div className='space-y-2'>
                        <Textarea
                            placeholder="Write message..."
                            {...form.register('message')}
                        />
                        <ErrorMessage 
                            errors={form.formState.errors} 
                            name="message"
                            render={({ message }) => <p className='text-xs p-2 bg-red-50 text-red-500'>{message}</p>}
                        />
                    </div>
                    <div className="h-4"></div>
                    <h3 className='font-bold text-sm mb-2'>Graded properties ({graded.length})</h3>
                    <div className='flex flex-col gap-2 relative z-0 min-h-[510px]'>
                        <EnquiryGradingMessagingList 
                            list={data}
                            context={{ upsertPidGrade, pidGrades }}
                            gradingComponent={Grading}
                            rowClassName="border rounded-lg"
                            renderRightSide={(row, index) => {
                                return (
                                    <div className='flex flex-col gap-3'>
                                        <CollapsibleSpecificNote 
                                            name={`notes.${index}`}
                                            data={row} 
                                        />
                                        {errors[row.id] && (
                                            <div className='text-red-500 text-sm bg-red-100 p-2 rounded-lg'>
                                                {errors[row.id]}
                                            </div>
                                        )}
                                    </div>
                                )
                            }}
                        />
                        {/* {data.map((item, index) => {

                            const { grade } = find(pidGrades, { pid: item.id })

                            const handleSelect = newGrade => {
                                upsertPidGrade(item.id, newGrade)
                                postMessage({
                                    type: 'GRADE_SHARING_UPDATE_GRADE',
                                    payload: {
                                        pid: item.id, 
                                        grade: newGrade
                                    }
                                })
                            }

                            return (
                                <div key={item.id} className='max-w-[550px] w-full'>
                                    <div                                 
                                        className="flex gap-4 bg-white border p-4 rounded-lg shadow-md min-h-[160px]">
                                        <div>
                                            <GradingWidget 
                                                size={20} 
                                                value={grade}
                                                className="grow"
                                                onSelect={handleSelect}
                                            />
                                        </div>
                                        <div className={cx('min-w-0', { 'opacity-40': grade === 1 })}>
                                            <PropertyDetail data={item} />
                                            <CollapsibleSpecificNote 
                                                name={`notes.${index}`}
                                                data={item} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            )
                        })} */}
                    </div>
                    <div className='bg-white border-t z-10 sticky bottom-0 p-3 flex gap-3 justify-center w-full'>
                        <Button type="button" variant="outline" onClick={() => postMessage({ type: "HIDE" })}>
                            Cancel
                        </Button>
                        <Button>Share</Button>
                    </div>
                </form>
            </Form>
        </>
    )
}

function Grading ({ row, context: { upsertPidGrade, pidGrades } }) {
    const { grade } = useMemo(() => find(pidGrades, { pid: row.id }), [row.id, pidGrades])

    const handleSelect = (newGrade) => {
        upsertPidGrade(row.id, newGrade)
        postMessage({
            type: 'GRADE_SHARING_UPDATE_GRADE',
            payload: {
                pid: row.id, 
                grade: newGrade
            }
        })
    }

    return (
        <GradingWidget 
            size={20} 
            value={grade}
            onSelect={handleSelect}
        />
    )
}

function CollapsibleSpecificNote ({ data, name }) {
    const form = useFormContext()
    const fieldRef = useRef()
  
    const [isOpen, setIsOpen] = useState(false)
    const { title } = data
  
    useEffect(() => {
  
      if (isOpen) {
        fieldRef.current.focus()
      }
  
    }, [isOpen])
  
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <div className='flex justify-start'>
            <CollapsibleTrigger className='text-sky-700 hover:underline text-sm'>
                specific message
            </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='py-3'>
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <Textarea 
                    placeholder={`Specific message for ${title}`} 
                    className="mb-1"
                    {...field}
                    ref={fieldRef}
                />
            )}
        />
            <span className='text-xs opacity-50'>This text will appear below the general message</span>
        </CollapsibleContent>
      </Collapsible>
    )
}