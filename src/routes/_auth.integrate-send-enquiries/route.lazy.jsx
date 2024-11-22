import { useMutation, useQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import useListing, { resolveAllPropertiesQuerySelector, useQueryfetchNewlyGradedProperties } from '@/store/use-listing'
import { postMessage, useIframeHelper } from '@/utils/iframeHelpers'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Form, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { FormField } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { OpenInNewWindowIcon } from '@radix-ui/react-icons'
import delay from '@/utils/delay'
import { sendBizchatPropertyEnquiry } from '@/services/bizchat'
import { isEmpty } from 'lodash'
import { cx } from 'class-variance-authority'
import { X } from 'lucide-react'
import GradingWidget from '@/components/GradingWidget'
import AssignTagInput from '@/features/tags/components/AssignTagInput'

export const Route = createLazyFileRoute('/_auth/integrate-send-enquiries')({
  component: Component
})

function Component () {
  
  const ref = useIframeHelper()
  const [sent, setSent] = useState([])
  
  const { auth } = Route.useRouteContext()

  const data = Route.useLoaderData()

  const form = useForm({
    defaultValues: {
      message: "please send me more information.",
      items: data?.map((property) => ({ 
        pdf: true, 
        viewing: false, 
        message: "", 
        property
      })) ?? []
    }
  })

  const controller = useRef()

  const mutation = useMutation({ mutationFn: sendBizchatPropertyEnquiry })

  const onSubmit = async (values) => {
    
    controller.current = new AbortController()

    try {

      for(const form of values.items) {

        if (controller.current.signal.aborted) break

        const pid = form.property.id
        if (sent.includes(pid)) continue

        await delay(150)

        if (process.env.NODE_ENV === 'production') {

          await mutation.mutateAsync({
            userId: auth.user.bz_uid, 
            form: {
              ...form,
              message: isEmpty(values.message) ? form.message: `${values.message}\n\n${form.message}`
            }
          })
  
          // postMessage({ type: "DESELECT", payload: pid })

        }

        setSent(prev => ([...prev, pid]))

        await delay(250)
        
      }
    
    } catch (e) {
      
      console.log(e)
      return

    } finally {

      controller.current = null

    }

  }
  
  const handleHide = () => {
    postMessage({ type: "HIDE" })
  }

  const finished = sent.length === data?.length

  if (data?.length < 1) {
    return (
      <div className='flex flex-col gap-8 items-center justify-center min-h-[300px] mx-auto'>
        <span className='text-lg font-bold text-slate-500 max-w-sm text-center'>
          No properties to email agents yet. When you Grade properties by most suitable you add them to this list</span>
        <Button onClick={handleHide} size="lg" variant="outline">Go back</Button>
      </div>
    )
  }
  
  const percentage = Math.round(sent.length / data?.length * 100)

  return (
    <>
      {form.formState.isSubmitting && (
        <div 
          className='absolute inset-0 bg-black/20 flex z-50'>
            <div className='flex flex-col m-auto bg-white shadow-xl p-8 rounded-md space-y-2'>
              <div className='bg-blue-50 w-40 rounded-xl'>
                <div 
                  className='relative transition-all h-3 flex bg-blue-500 min-w-1 rounded-xl shadow-md' 
                  style={{ width: `${percentage}%` }}
                >
                  <span className='absolute flex gap-1 flex-nowrap -right-5 -top-5 m-auto drop-shadow-sm'>
                    <span className='text-blue-500 text-xs font-bold'>{sent.length}</span>
                    <span className='text-slate-400 text-xs text-nowrap'>/ {data?.length}</span> 
                  </span>
                </div>
              </div>
              <div className='text-center text-xs text-slate-400'>Do not close tab</div>
              <Button onClick={() => controller.current?.abort('cancelled reason')} className="self-center">Pause</Button>
            </div>
          </div>
      )}
      <button
        onClick={handleHide}
        className="absolute z-20 right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      <div className="h-2"></div>
      <FormProvider {...form}>
        <form ref={ref} className="overflow-hidden relative z-10 flex flex-col space-y-5 p-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className='space-y-1'>
              <label htmlFor="message" className='font-bold text-sm'>Dear agents</label>
              <Textarea 
                {...form.register("message")} 
                disabled={finished}
                placeholder="Write message for all property enquiries" 
                id="message" 
              />
              <span className='text-xs opacity-50'>A general message for each property enquiry listed below</span>
            </div>
            <div className='border shadow-lg space-y-0'>
              <div className='flex items-center font-bold p-3 bg-gray-100'>
                <span className='mr-auto text-sm'>{data?.length} properties</span>
                
              </div>
              <div className="space-y-0 max-h-[400px] overflow-y-auto">
                {data?.map((details, index) => {
                  const { id, title, statusColor, statusText, sizeText, tenureText, thumbnail, content, original } = details
                  
                  return (
                    <div key={id} className="space-y-0 p-4 even:bg-sky-50">
                      <div className='flex gap-4'>
                        <div>
                          <Grading pid={id} defaultValue={original.grade} />
                        </div>
                        <img src={thumbnail} className="object-contain size-10 sm:size-28 bg-gray-200" />
                        <div className="space-y-3 sm:space-y-2 text-sm flex-grow">
                          <a href={`https://4prop.com/view-details/${id}`} target="_blank" className='font-bold hover:underline'>
                            {title}
                            <OpenInNewWindowIcon className='inline ml-1 opacity-50' />
                          </a>
                          <div className='flex flex-col sm:flex-row gap-0 sm:gap-3'>
                            <div className={cx("font-bold", { 
                              "text-green-600": statusColor === "green",
                              "text-amber-600": statusColor === "amber",
                              "text-sky-600": statusColor === "sky",
                              "text-red-600": statusColor === "red",
                            })}>{statusText}</div>
                            <div>{sizeText}</div>
                            <div>{tenureText}</div>
                          </div>
                          <div className="opacity-60 truncate max-w-[360px]">{content.teaser}</div>
                          {sent.includes(id) ? (
                            <i className='border rounded-lg px-1 shadow-sm inline-block text-slate-600'>Sent!</i>
                          ) : form.formState.isSubmitting ? (
                            <span className='inline-block bg-amber-50 text-amber-600'>Sending...</span>
                          ) : (
                            <FormItems index={index} item={details} />
                          )}
                        </div>
                      </div>                
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="h-3"></div>
            <div className='space-y-1 text-sm px-4'>
                <div>{auth.displayName}</div>
                <div className='text-slate-500 italic'>CompanyName</div>
                <ul className="flex gap-3">
                  <li className='text-slate-500 italic'>DDI</li> 
                  <li className='text-slate-500 italic'>Mobile</li>
                  <li className='text-slate-500 italic'>Branch address</li>
                </ul>
            </div>
            <div>
                <div className='flex gap-3 justify-center'>
                    {finished ? (
                      <Button onClick={handleHide} className="mx-auto">Finish</Button>
                    ) : form.formState.isSubmitting ? (
                      <>
                        <Button className="mx-auto" disabled>Sending...</Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={handleHide} variant="outline">Cancel</Button>
                        <Button type="submit">Email</Button>
                      </>
                    )}
                </div>
            </div>
        </form>
      </FormProvider>
    </>
  )
}

function Grading ({ pid, defaultValue }) {
  const [value, setValue] = useState(defaultValue)
  
  const handleSelect = newValue => {
    setValue(newValue)
    postMessage({ 
      type: "GRADE_CHANGED", 
      payload: newValue, 
      meta: { 
        pid,
        prevGrade: value
      } 
    })
  }

  return (
    <GradingWidget 
        size={20}
        value={value} 
        onSelect={handleSelect}
    />
  )
}

function FormItems ({ index, item }) {
  const form = useFormContext()
  const fieldRef = useRef()

  const [isOpen, setIsOpen] = useState(false)
  const { title } = item

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
      <div className='flex flex-col sm:flex-row text-sm gap-2 sm:gap-5'>
        <FormItemsCheckbox index={index} name="pdf" label="PDF" />
        <FormItemsCheckbox index={index} name="viewing" label="Viewing" />
        <CollapsibleTrigger className='text-sky-700 hover:underline self-start'>
          specific message
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='py-3'>
        <FormField
          control={form.control}
          name={`items.${index}.message`}
          render={({ field }) => (
            <Textarea 
              {...field} 
              ref={fieldRef} 
              placeholder={`Specific message for ${title}`} 
              className="mb-1"
            />
          )}
        />
        <span className='text-xs opacity-50'>This text will appear below the general message</span>
      </CollapsibleContent>
    </Collapsible>
  )
}

function FormItemsCheckbox ({ index, name, label }) {
  const form = useFormContext()
  return (
    <FormField
      control={form.control}
      name={`items.${index}.${name}`}
      render={({ field }) => (
        <div className="flex items-center">
          <Checkbox 
            id={`${name}${index}`} 
            checked={field.value}
            onCheckedChange={field.onChange}
          /> 
          <label htmlFor={`${name}${index}`} className='pl-2 cursor-pointer'>{label}</label>
        </div>
      )}
    />
  )
}