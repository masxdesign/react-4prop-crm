import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import useListing, { filteredByTagsDetailsSelector, resolveAllPropertiesQuerySelector, tagsFromPropertiesSelector, useQueryfetchNewlyGradedProperties } from '@/store/use-listing'
import { inIframe, postMessage, useIframeHelper } from '@/utils/iframeHelpers'
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
import { cn } from '@/lib/utils'

export const Route = createLazyFileRoute('/_auth/integrate-send-enquiries/')({
  component: Component
})

const isIframe = inIframe()

function Component () {
  
  const ref = useIframeHelper()

  const [sent, setSent] = useState([])

  const { auth, origin } = Route.useRouteContext()

  const tags = useListing(tagsFromPropertiesSelector)
  const data = useListing(filteredByTagsDetailsSelector)

  const form = useForm({
    defaultValues: {
      message: "",
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

  const no_properties = tags.length < 1 && data?.length < 1
  const finished = data?.length > 0 && sent.length === data?.length
  const disable_email_button = data?.length < 1

  if (no_properties) {
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
      {isIframe && (
        <button
          onClick={handleHide}
          className="absolute z-20 right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
      <FormProvider {...form}>
        <form ref={ref} className="relative z-10 flex flex-col py-8" onSubmit={form.handleSubmit(onSubmit)}>
          
          <div className='space-y-2 mb-4'>
            <h1 className='text-3xl font-bold'>
              Email agents
            </h1>
            <p className='text-muted-foreground'>
              Start a conversation with agents dealing with properties in your suitable listing. Send to all or only to those in a particular search reference
            </p>
          </div>

          <div className='space-y-8'>

            <div className='space-y-2'>
              <label htmlFor="message" className='font-bold text-sm'>Dear agents</label>
              <Textarea 
                {...form.register("message")} 
                disabled={finished}
                placeholder="write here a request that applies to every Property below,&#10;eg. your proposed use of the Property and if suitable OR viewing dates &#10;The specific message is for each individual Property" 
                id="message" 
              />
            </div>

            <div className='space-y-2 rounded'>
              <div className='font-bold text-sm flex gap-2 justify-between'>
                <span>Enquire on {data.length} properties</span>
                <span className='text-center text-xs font-normal text-muted-foreground'>Scroll right to see more 'search references'</span>
              </div>
              <div className='border shadow-sm space-y-0 w-11/12 lg:w-full'>
                
                <div className='flex flex-col gap-2 px-2 py-2 bg-gray-100'>
                  {tags.length > 0 && <FilterByTag tags={tags} />}
                </div>

                <div className="space-y-0 max-h-[450px] overflow-y-auto">
                  {data.map((details, index) => {
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

            </div>

            <div className='flex'>
              <div className='space-y-1 text-sm px-4'>
                  <div>{auth.displayName}</div>
                  <div className='text-slate-500 italic'>CompanyName</div>
                  <ul className="flex gap-3">
                    <li className='text-slate-500 italic'>DDI</li> 
                    <li className='text-slate-500 italic'>Mobile</li>
                    <li className='text-slate-500 italic'>Branch address</li>
                  </ul>
              </div>
              <div className='self-end ml-auto flex gap-4'>
                {finished ? (
                  <Button onClick={handleHide} className="mx-auto">Finish</Button>
                ) : form.formState.isSubmitting ? (
                  <>
                    <Button className="mx-auto" disabled>Sending...</Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleHide} variant="outline" asChild>
                      <a href={origin}>
                        Cancel
                      </a>
                    </Button>
                    <Button type="submit" disabled={disable_email_button}>Email</Button>
                  </>
                )}
              </div>
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
  const { title, tag_name } = item

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
        <FormItemsCheckbox index={index} name="viewing" label="View" />
        <CollapsibleTrigger className='text-sky-700 hover:underline'>
          specific message
        </CollapsibleTrigger>
        <span className='ml-auto border border-slate-200 text-slate-500 text-xs rounded px-2 py-1'>
          {tag_name ? tag_name: "Unnamed"}
        </span>
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

function FilterByTag({ tags }) {
  const [allChecked, setAllChecked] = useState(true)

  const filterByTagsChange = useListing.use.filterByTagsChange()
  const filterByTags = useListing.use.filterByTags()
  const setFilterByTagsChange = useListing.use.setFilterByTagsChange()

  const selectToggle = (checked) => {
    setAllChecked(checked) 

    if (checked) {
      setFilterByTagsChange(tags.map(row => `${row.id}`))
      return
    }

    setFilterByTagsChange([])
  }

  const handleSelectAll = (e) => {
    selectToggle(e.target.checked)
  }
  
  const handleChange = (e) => {
    filterByTagsChange(e.target)
    setAllChecked(false)
  }

  useEffect(() => {

    selectToggle(true)

  }, [])

  return (
    <ul className='flex flex-col gap-1 items-start flex-wrap max-h-[120px] overflow-auto'>
      <TagPill 
        name="All"
        onChange={handleSelectAll}
        checked={allChecked}
      />
      {tags.map((tag) => (
        <TagPill 
          key={tag.id}
          name={tag.name}
          value={tag.id}
          onChange={handleChange}
          checked={filterByTags.includes(`${tag.id}`)}
        />
      ))}
    </ul>
  )
}

function TagPill({ name, value, className, onChange, checked, ...props }) {
  return (
    <li className={cn('bg-white px-2 py-1 text-sm rounded', className)}>
      <label className='flex gap-2 items-center'>
        <input type='checkbox' name="tag" value={value} onChange={onChange} checked={checked}  {...props} />
        <span className='flex-1'>
          {name}
        </span>
      </label>
    </li>
  )
}