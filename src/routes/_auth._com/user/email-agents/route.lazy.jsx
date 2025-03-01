import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import useListing, { filteredByTagsDetailsSelector, IS_NULL, propertyGradeChanged, propertyRemoved, propertySearchReferenceChanged, resolveAllPropertiesQuerySelector, tagsFromPropertiesSelector, useQueryfetchNewlyGradedProperties } from '@/store/use-listing'
import { inIframe, postMessage, useIframeHelper } from '@/utils/iframeHelpers'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Form, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { FormField } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { OpenInNewWindowIcon } from '@radix-ui/react-icons'
import delay from '@/utils/delay'
import { sendBizchatPropertyEnquiry } from '@/services/bizchat'
import _, { isEmpty, map } from 'lodash'
import { cx } from 'class-variance-authority'
import { Loader2Icon, X } from 'lucide-react'
import GradingWidget from '@/components/GradingWidget'
import { cn } from '@/lib/utils'
import TogglableTruncateContent from '@/components/TogglableTruncateContent/CollapsibleContent'
import EnquiryGradingMessagingList from '@/features/messaging/components/EnquiryGradingMessagingList'
import SearchReferenceSelect from '@/features/searchReference/component/SearchReferenceSelect'
import { useGradeUpdater } from '@/features/searchReference/searchReference.mutation'
import { useIsFirstRender } from '@uidotdev/usehooks'

export const Route = createLazyFileRoute('/_auth/_com/user/email-agents')({
  component: Component
})

function Component () {
  
  const ref = useIframeHelper()

  const [sent, setSent] = useState([])

  const { auth, origin } = Route.useRouteContext()

  const tags = useListing(tagsFromPropertiesSelector)
  const data = useListing(filteredByTagsDetailsSelector)

  const pids = useMemo(() => map(data, "id"), [data])
  const filteredSent = useMemo(() => sent.filter(pid => pids.includes(pid)), [pids, sent])
  const left = useMemo(() => pids.length - filteredSent.length, [pids, filteredSent])

  const no_properties = tags.length < 1 && pids?.length < 1
  const finished = pids?.length > 0 && filteredSent.length === pids?.length
  const disable_email_button = pids?.length < 1
  const percentage = Math.round(filteredSent.length / pids?.length * 100)

  const form = useForm({
    values: {
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

  const sendPropertyEnquiry = useMutation({ 
    mutationFn: sendBizchatPropertyEnquiry 
  })

  const onSubmit = async (values) => {
    
    controller.current = new AbortController()

    try {

      for(const form of values.items) {

        if (controller.current.signal.aborted) break

        const pid = form.property.id
        if (sent.includes(pid)) continue

        await delay(150)

        console.log(form);
        
        // if (process.env.NODE_ENV === 'production') {

        if (form.property.agents.length < 1) {
          throw new Error("property.agents empty")
        }

        await sendPropertyEnquiry.mutateAsync({
          from: auth.bzUserId, 
          recipients: form.property.agents,
          message: isEmpty(values.message) ? form.message: `${values.message}\n\n${form.message}`,
          property: form.property,
          choices: {
            pdf: form.pdf,
            viewing: form.viewing
          },
          applicant_uid: null
        })

        // }

        setSent(prev => ([...prev, pid]))
        await delay(250)
        
      }
    
    } catch (e) {
      
      console.log(e)

    } finally {

      controller.current = null

    }

  }
  
  const handleHide = () => {
    postMessage({ type: "HIDE" })
  }

  if (no_properties) {
    return (
      <div className='flex flex-col gap-8 items-center justify-center min-h-[300px] mx-auto'>
        <span className='text-lg font-bold text-slate-500 max-w-sm text-center'>
          No properties to email agents yet. When you Grade properties by most suitable you add them to this list</span>
        <Button onClick={handleHide} size="lg" variant="outline">Go back</Button>
      </div>
    )
  }

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
                    <span className='text-blue-500 text-xs font-bold'>{filteredSent.length}</span>
                    <span className='text-slate-400 text-xs text-nowrap'>/ {pids?.length}</span> 
                  </span>
                </div>
              </div>
              <div className='text-center text-xs text-slate-400'>Do not close this tab</div>
              <Button size="xs" onClick={() => controller.current?.abort('cancelled reason')} className="self-center">Pause</Button>
            </div>
          </div>
      )}
      <FormProvider {...form}>
        <form ref={ref} className="relative z-10 flex flex-col py-8" onSubmit={form.handleSubmit(onSubmit)}>
          
          <div className='space-y-2 mb-4'>
            <h1 className='text-3xl font-bold'>
              Email agents
            </h1>
            <TogglableTruncateContent 
              className="text-muted-foreground"
              content="This page starts your conversations with agents for Properties you have considered suitable (1-3 stars). Email for one or many 'Search References’ at the same time (unless you want to differentiate between one SearchRef and another). The conversations will then move into the 'Active’ tab, until you reject a Property x, when it will move into 'Inactive'. You can regrade Properties at any time to bring your list to the most suitable Property you want to rent or buy."
            />
          </div>

          <div className='space-y-8'>

            <div className='space-y-2'>
              <label htmlFor="message" className='font-bold text-sm'>Dear agents</label>
              <Textarea 
                {...form.register("message")} 
                disabled={finished}
                placeholder="Write here a universal message that applies to every property below.&#10;eg. your proposed use for the property, asking if it would be suitable, or preferred viewing dates.&#10;The 'specific message' is for each individual property." 
                id="message" 
              />
            </div>

            <div className='space-y-2 rounded'>
              <div className='text-sm flex gap-2 items-center'>
                <span className='font-bold'>Enquire on {data.length} properties</span>
                <span className='text-center text-xs font-normal text-muted-foreground'>scroll right if more 'Search References'</span>
              </div>
              <div className='border shadow-sm space-y-0 w-11/12 lg:w-full'>
                
                <div className='flex flex-col gap-2 px-2 py-2 bg-gray-100'>
                  {tags.length > 0 && <FilterByTag tags={tags} />}
                </div>

                <div className="space-y-0 max-h-[450px] overflow-y-auto">
                  <EnquiryGradingMessagingList 
                    list={data}
                    gradingComponent={Grading}
                    rowClassName="even:bg-sky-50"
                    renderRightSide={(row, index) => {
                      return filteredSent.includes(row.id) ? (
                        <div className='flex gap-2 items-center'>
                          <i className='border rounded-lg px-1 shadow-sm inline-block text-slate-600'>Sent!</i>
                          <SearchReferenceEmailAgents row={row} isAgent={auth.isAgent} />
                        </div>
                      ) : form.formState.isSubmitting ? (
                        <div className='flex gap-2 items-center'>
                          <span className='inline-block bg-amber-50 text-amber-600'>Sending...</span>
                          <SearchReferenceEmailAgents row={row} isAgent={auth.isAgent} />
                        </div>
                      ) : (
                        <PdfViewSpecifyMessage index={index} item={row} isAgent={auth.isAgent} />
                      )
                    }}
                  />
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
                  <Button asChild>
                    <Link to="enquiries">
                      Finish
                    </Link>
                  </Button>
                ) : form.formState.isSubmitting ? (
                  <>
                    <Button className="mx-auto" disabled>Sending...</Button>
                  </>
                ) : (
                  <>
                    {origin && (
                      <Button variant="outline" asChild>
                        <a href={origin}>
                          Cancel
                        </a>
                      </Button>
                    )}
                    <Button className="space-x-2" type="submit" disabled={disable_email_button}>
                      <span>
                        Email
                      </span>
                      {left > 0 && <span className='text-xs bg-amber-600 px-1 rounded'>{left}</span>}
                    </Button>
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

const SearchReferenceEmailAgents = ({ row, isAgent }) => {
  const handleSelect = (tag) => {
    useListing.getState().filterByTagsChange({ value: tag.id, checked: true })
    useListing.getState().dispatch(propertySearchReferenceChanged(row.id, tag))
  }

  const handleClick = (selected) => {
    useListing.getState().setAllChecked(false)
    useListing.getState().setFilterByTagsChange([])
    useListing.getState().filterByTagsChange({ value: selected ? selected.id: IS_NULL, checked: true })
  }

  return (
    <Suspense fallback={<Loader2Icon className="animate-spin" />}>
      <SearchReferenceSelect 
        pid={row.id} 
        tag_id={row.tag_id} 
        onSelect={handleSelect}
        onClick={handleClick}
        isAgent={isAgent}
      />
    </Suspense>
  )
}

const Grading = ({ row }) => {
  const { id, grade } = row
  const gradeUpdater = useGradeUpdater(id)

  const handleSelect = async (grade) => {

    await gradeUpdater.mutateAsync({ grade })

    if (grade === 1) {
      useListing.getState().dispatch(propertyRemoved(id))
      return
    }

    useListing.getState().dispatch(propertyGradeChanged(id, grade))

  }

  return (
      <GradingWidget 
          size={20}
          value={grade}
          onSelect={handleSelect}  
          tooltipTextReject="Drop from list"                                       
      />
  )
}

function PdfViewSpecifyMessage ({ index, item, isAgent }) {
  const form = useFormContext()
  const fieldRef = useRef()

  const [isOpen, setIsOpen] = useState(false)

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
        <SearchReferenceEmailAgents row={item} isAgent={isAgent} />
      </div>
      <CollapsibleContent className='py-3'>
        <FormField
          control={form.control}
          name={`items.${index}.message`}
          render={({ field }) => (
            <Textarea 
              {...field} 
              ref={fieldRef} 
              placeholder={`Specific message for ${item.title}`} 
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
  const allChecked = useListing.use.allChecked()
  const setAllChecked = useListing.use.setAllChecked()
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