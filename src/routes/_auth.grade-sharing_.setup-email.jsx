import GradingWidget from '@/components/GradingWidget'
import PropertyDetail from '@/components/PropertyDetail'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormField } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { usePidGradesMutation } from '@/features/gradeSharing/hooks'
import { useGradeSharingInfoSelector, useGradeSharingStore } from '@/hooks/useGradeSharing'
import useListing, { resolveAllPropertiesQuerySelector } from '@/store/use-listing'
import { postMessage } from '@/utils/iframeHelpers'
import { createImmer } from '@/utils/zustand-extras'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { cx } from 'class-variance-authority'
import { countBy, find } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFormContext } from 'react-hook-form'

export const Route = createFileRoute('/_auth/grade-sharing/setup-email')({
  component: SetupEmailComponent
})

function SetupEmailComponent () {

    const { tag, selected, pidGrades } = useGradeSharingInfoSelector()
    const upsertPidGrade = useGradeSharingStore.use.upsertPidGrade()

    const { data } = useSuspenseQuery(useListing(resolveAllPropertiesQuerySelector))    

    const pidGradesMutation = usePidGradesMutation()

    const form = useForm({
        defaultValues: {
            message: "",
            notes: Array(data.length).fill("")
        }
    })

    const onSubmit = async (values) => {

        const result = await pidGradesMutation.mutateAsync({
            recipient_import_id: selected.id, 
            tag_id: tag.id,
            pidGrades
        })

        console.log(result)

        console.log(values, pidGrades, tag, selected)

        postMessage({ type: "GRADE_SHARING_RESET" })
        postMessage({ type: "HIDE" })
        
    }

    const graded = useMemo(
        () => pidGrades.filter(item => item.grade !== 1), 
        [pidGrades]
    )

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className='space-y-2 sticky top-0 bg-white z-10 border-b p-3'>
                    <label htmlFor="message" className='font-bold text-sm'>General message</label>
                    <Textarea
                        placeholder="Write message..."
                        {...form.register('message')}
                    />
                    <span className='text-xs opacity-50'>A general message</span>
                    <div className="h-3"></div>
                    <h3 className='font-bold text-sm'>Graded properties ({graded.length})</h3>
                </div>
                <div className='flex flex-col p-3 gap-2 items-start relative z-0 min-h-[510px]'>
                    {data.map((item, index) => {

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
                    })}
                </div>
                <div className='bg-white border-t z-10 sticky bottom-0 p-3 flex gap-3 justify-center w-full'>
                    <Button type="button" variant="outline" onClick={() => postMessage({ type: "HIDE" })}>
                        Cancel
                    </Button>
                    <Button>Share</Button>
                </div>
            </form>
        </Form>
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
        <div className='flex justify-end'>
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