import { useQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'
import useListing, { resolveAllPropertiesQuerySelector } from '@/store/use-listing'
import { useIframeHelper } from '@/utils/iframeHelpers'
import { Textarea } from '@/components/ui/textarea'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { useEffect, useRef, useState } from 'react'
import { Form, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { FormField } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { OpenInNewWindowIcon } from '@radix-ui/react-icons'

export const Route = createLazyFileRoute('/_admin/_remote/integrate/send-enquiry')({
  component: Component
})

function Component () {
  const ref = useIframeHelper()

  const { data } = useQuery(useListing(resolveAllPropertiesQuerySelector))

  const form = useForm({
    defaultValues: {
      message: "Hi,\nplease send me more information.",
      items: data.map(({ id }) => ({ 
        pdf: true, 
        viewing: false, 
        message: "", 
        id 
      }))
    }
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <FormProvider {...form}>
      <form ref={ref} className="flex flex-col space-y-8 p-1" onSubmit={form.handleSubmit(onSubmit)}>
          <div className='space-y-1'>
            <label htmlFor="message" className='font-bold text-sm'>General message</label>
            <Textarea {...form.register("message")} placeholder="Write message for all property enquiries" id="message" />
            <span className='text-xs opacity-50'>A general message for each property enquiry listed below</span>
          </div>
          <div className='border shadow-lg space-y-0'>
            <div className='font-bold p-3 bg-gray-100'>{data.length} properties</div>
            <div className="overflow-y-auto max-h-[500px] space-y-3">
              {data.map((item, index) => {
                const { id, title, sizeText, tenureText, thumbnail, content } = item
                return (
                  <div key={id} className="space-y-3 hover:bg-sky-50 p-3">
                    <div className='flex gap-3'>
                      <img src={thumbnail} className="object-contain w-20 h-20 bg-gray-200" />
                      <div className="space-y-1 text-sm flex-grow">
                        <a href={`https://4prop.com/view-details/${id}`} target="_blank" className='font-bold hover:underline'>
                          {title}
                          <OpenInNewWindowIcon className='inline ml-1 opacity-50' />
                        </a>
                        <div className='flex gap-3'>
                          <div>{sizeText}</div>
                          <div>{tenureText}</div>
                        </div>
                        <div className="opacity-60">{content.teaser}</div>
                        <FormItems index={index} item={item} />
                      </div>
                    </div>                
                  </div>
                )
              })}
            </div>
          </div>
          <Button type="submit" className="mx-auto">Send enquiries</Button>
      </form>
    </FormProvider>
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
      <div className='flex text-sm gap-5'>
        <FormItemsCheckbox index={index} name="pdf" label="PDF" />
        <FormItemsCheckbox index={index} name="viewing" label="Viewing" />
        <CollapsibleTrigger className='text-sky-700 hover:underline'>
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