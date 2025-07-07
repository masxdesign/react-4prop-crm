import { authUserCompactOneEmail } from '@/components/Auth/Auth'
import GradingWidget from '@/components/GradingWidget'
import PropertyDetail from '@/components/PropertyDetail'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormField } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { usePidGradesMutation } from '@/features/gradeSharing/hooks'
import EnquiryGradingMessagingList from '@/features/messaging/components/EnquiryGradingMessagingList'
import { useGradeSharingInfoSelector, useGradeSharingStore } from '@/hooks/useGradeSharing'
import { getUidByImportId, propertyGradeShareOneEmailAsync, sendBizchatPropertyEnquiry, sendBizchatPropertyGradeShare } from '@/services/bizchat'
import { FOURPROP_BASEURL } from '@/services/fourPropClient'
import useListing, { propertyCompactCombiner, resolveAllPropertiesQuerySelector } from '@/store/use-listing'
import delay from '@/utils/delay'
import { postMessage } from '@/utils/iframeHelpers'
import { createImmer } from '@/utils/zustand-extras'
import { ErrorMessage } from '@hookform/error-message'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useLocalStorage } from '@uidotdev/usehooks'
import { cx } from 'class-variance-authority'
import { produce } from 'immer'
import _, { countBy, find, findIndex, isEmpty, set } from 'lodash'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import * as yup from "yup"

export const Route = createFileRoute('/_auth/grade-sharing/setup-email')({
  component: SetupEmailComponent
})

const initialSentState = {
    generalMessage: "",
    pids: {},
    notes: {}
}

const markSent = (pid) => ({
    type: "MARK_SENT",
    meta: { pid }
})

const resetSent = () => ({
    type: "RESET_SENT"
})

const saveMessage = (message) => ({
    type: "SAVE_MESSAGE",
    payload: message
})

const saveNotes = (notes) => ({
    type: "SAVE_NOTES",
    payload: notes
})

const sentReducer = (state, action) => {
    switch (action.type) {
        case "SAVE_MESSAGE": 
            return produce(state, draft => {
                draft.generalMessage = action.payload
            })
        case "SAVE_NOTES": 
            return produce(state, draft => {
                draft.notes = {
                    ...action.payload
                }
            })
        case "MARK_SENT": 
            return produce(state, draft => {
                draft.pids[action.meta.pid] = true
            })
        case "RESET_SENT":
            return initialSentState
        default:
            return state
    }
}

const initialErrors = {}

const schema = yup.object({
    message: yup.string().max(200).required().label("General message")
})

function SetupEmailComponent () {
    
    const { data } = useSuspenseQuery(useListing(resolveAllPropertiesQuerySelector))  

    const { auth } = Route.useRouteContext()
    
    const { tag, selected, pidGrades } = useGradeSharingInfoSelector()
    const upsertPidGrade = useGradeSharingStore.use.upsertPidGrade()
    
    const storageKey = `grade-sharing-sent-${auth.user.id}.${selected.id}`

    const [sent, dispatch] = useReducer(
        sentReducer, 
        initialSentState,
        (initial) => {
            const store = JSON.parse(localStorage.getItem(storageKey)) || initial

            const initialNotes = data.map((row) => ([row.id, store.notes[row.id] || ""]))

            return {
                ...store,
                notes: Object.fromEntries(initialNotes)
            }
        }
    )

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(sent))
    }, [sent])

    
    const graded = useMemo(
        () => pidGrades.filter((item) => item.grade !== 1), 
        [pidGrades]
    )

    
    const [pausing, setPausing] = useState(false)
    const [errors, setErrors] = useState(initialErrors)

    const {
        sent_count,
        percentage,
        isResume
    } = useMemo(() => {
        const pidSent = graded.filter((row) => sent.pids[row.pid]).map((row) => row.pid)
        const sent_count = Object.keys(pidSent).length
        const percentage = Math.round(sent_count / graded.length * 100)
        const isResume = percentage > 0 && percentage < 100

        return {
            sent_count,
            percentage,
            isResume
        }
    }, [graded, sent])
    
    const controller = useRef()

    const sendPropertyEnquiry = useMutation({ 
        mutationFn: async (values) => {

            let errors_sending = {}

            let _tag = { ...tag }

            controller.current = new AbortController()

            const generalMessage = values.message

            const { uid } = await getUidByImportId(auth.authUserId, selected.id, true)

            try {

                let properties_compact = []

                for(let i = 0; i < graded.length; i++) {
                    if (controller.current.signal.aborted) {
                        setPausing(false)
                        return
                    }

                    const { pid, grade } = graded[i]

                    if (sent.pids[pid]) continue

                    const specificMessage = values.notes[pid] 

                    const property = find(data, { id: pid })
                    const propertyCompact = propertyCompactCombiner(property)

                    properties_compact = produce(properties_compact, (draft) => {
                        draft.push({
                            ...propertyCompact,
                            grade,
                            specificMessage
                        })
                    })

                    try {

                        const {
                            gradeShareResult
                        } = await sendBizchatPropertyGradeShare({ 
                            uid, 
                            pid, 
                            grade, 
                            from: auth.bzUserId,
                            from_uid: auth.user.id, 
                            tag: _tag, 
                            message: isEmpty(specificMessage) 
                                ? generalMessage
                                : `${generalMessage}\n\n${specificMessage}`,
                            property
                        })

                        if (_tag.id === -1) {
                            _tag = {
                                ..._tag,
                                id: gradeShareResult.tag.id
                            }
                        }

                    } catch (e) {

                        if (e.message === 'Already graded') {
                            dispatch(markSent(pid))
                        }

                        errors_sending = { ...errors_sending, [pid]: e.message }
                        continue
                    }

                    dispatch(markSent(pid))
                    await delay(250)

                }

                if (Object.keys(errors_sending).length > 0) {
                    setErrors(errors_sending)
                }

                const n = 1
                const top_n_properties = properties_compact.slice(0, n)

                return propertyGradeShareOneEmailAsync({
                    tag: _tag,
                    applicant_uid: uid,
                    properties_count: properties_compact.length,
                    sharing_agent: authUserCompactOneEmail(auth),
                    generalMessage,
                    properties: top_n_properties
                })

            } catch (e) {
                console.log(e)
            } finally {
                controller.current = null
            }

        },
        onSuccess: () => {
            postMessage({ type: "GRADE_SHARING_RESET" })
        }
    })

    const form = useForm({
        defaultValues: {
            message: sent.generalMessage,
            notes: sent.notes
        },
        resolver: yupResolver(schema)
    })

    useEffect(() => {
        const { unsubscribe } = form.watch((value) => {
            dispatch(saveMessage(value.message))
            dispatch(saveNotes(value.notes))
        })
        return () => unsubscribe()
    }, [form.watch])

    const handleFinished = () => {
        dispatch(resetSent())
        postMessage({ type: "HIDE" })
    }

    const handlePause = () => {
        controller.current?.abort('cancelled reason')
        setPausing(true)
    }

    const generalMessagePlaceholder = `Write your general message here for all these Properties\nthen add a specific message below at a Property\nthen click 'Share'`

    return (
        <>
            {form.formState.isSubmitting && (
                <div 
                className='fixed inset-0 bg-black/20 flex z-50'>
                    <div className='flex flex-col m-auto bg-white shadow-xl px-8 py-4 rounded-md gap-2'>
                    <strong className='mb-4 text-center'>{pausing ? 'Pausing...' : 'Sending'}</strong>
                    <div className='bg-blue-50 w-40 rounded-xl'>
                        <div 
                        className='relative transition-all h-3 flex bg-blue-500 min-w-1 rounded-xl shadow-md' 
                        style={{ width: `${percentage}%` }}
                        >
                        <span className='absolute flex gap-1 flex-nowrap -right-5 -top-5 m-auto drop-shadow-sm'>
                            <span className='text-blue-500 text-xs font-bold'>{sent_count}</span>
                            <span className='text-slate-400 text-xs text-nowrap'>/ {graded.length}</span> 
                        </span>
                        </div>
                    </div>
                    <div className='text-center text-xs text-slate-400'>Do not close this tab</div>
                        <Button size="xs" onClick={handlePause} disabled={pausing} className="self-center">
                            Pause
                        </Button>
                    </div>
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(sendPropertyEnquiry.mutateAsync)} className='flex flex-col gap-3 px-3'>
                    <div className='space-y-2 sticky top-0 bg-white z-40 shadow-md -mx-3 px-3 py-3'>
                        <Textarea
                            placeholder={generalMessagePlaceholder}
                            {...form.register('message')}
                        />
                        <ErrorMessage 
                            errors={form.formState.errors} 
                            name="message"
                            render={({ message }) => <p className='text-xs p-2 bg-red-50 text-red-500'>{message}</p>}
                        />
                    </div>
                    <div className='flex flex-col gap-4 sm:gap-2 relative z-0'>
                        <EnquiryGradingMessagingList 
                            list={data}
                            context={{ upsertPidGrade, pidGrades, sent }}
                            gradingComponent={Grading}
                            rowClassName="border-4 shadow-md rounded-lg"
                            propertyTitleUrlLinkPath={`${FOURPROP_BASEURL}/mini/$pid`}
                            sentPidsArray={sent.pids}
                            renderRightSide={(row) => {
                                return (
                                    <div className='flex flex-col sm:items-start items-center gap-3'>
                                        <CollapsibleSpecificNote 
                                            name={`notes.${row.id}`}
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
                    </div>
                    <div className='h-[65px]'></div>
                    <div className='bg-white border-t-2 shadow-xl z-10 fixed inset-x-0 bottom-0 p-3 flex gap-3 justify-center w-full'>
                        <Button type="button" variant="outline" onClick={() => postMessage({ type: "HIDE" })}>
                            Back
                        </Button>
                        {percentage > 99 ? (
                            <Button type="button" onClick={handleFinished}>Finished</Button>
                        ) : (
                            <Button>{isResume ? "Resume": "Share"}</Button>
                        )}
                    </div>
                </form>
            </Form>
        </>
    )
}

function Grading ({ row, context: { sent, upsertPidGrade, pidGrades } }) {
    const { grade } = useMemo(() => find(pidGrades, { pid: row.id }), [row.id, pidGrades])

    const handleSelect = (newGrade) => {
        if (sent.pids[row.id]) return 

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
            className="pointer-events-none"
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
        <div className='flex justify-center'>
            <CollapsibleTrigger className='text-sky-700 hover:underline text-sm'>
                specific message
            </CollapsibleTrigger>
        </div>
        <CollapsibleContent className='p-2'>
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <Textarea 
                        placeholder={`Specific message for ${title}`} 
                        className="mb-1"
                        {...field}
                        maxLength={200}
                        ref={fieldRef}
                    />
                )}
            />
            <span className='block text-center text-xs opacity-50'>This text will appear below the general message. 200 characters max.</span>
        </CollapsibleContent>
      </Collapsible>
    )
}