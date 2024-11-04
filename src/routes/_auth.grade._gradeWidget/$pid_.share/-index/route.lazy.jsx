import { useMemo, useState } from 'react'
import { useAuth } from '@/components/Auth/Auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { crmFilterByEmail } from '@/services/bizchat'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useDebounce } from '@uidotdev/usehooks'
import { cx } from 'class-variance-authority'
import { ArrowLeftCircleIcon, ArrowRight, ExternalLink, Loader2, MailWarning, MessageSquareWarningIcon, SearchIcon } from 'lucide-react'
import { CheckIcon } from '@radix-ui/react-icons'
import { useGradeShareContext, useGradeShareFilterByEmailQuery } from '@/routes//_auth.grade._gradeWidget/$pid_.share'
import Selection from '@/components/Selection'
import HoverOverlayWarningText from '@/components/HoverOverlayWarningText'
import { BASEPATH, WINDOWN_NAMES } from '@/constants'

export const Route = createLazyFileRoute('/_auth/grade/_gradeWidget/$pid/share/')({
  component: IntegrateGradingComponent
})

function IntegrateGradingComponent () {

  const { onConfirm } = useGradeShareContext()
  
  const [value, setValue] = useState("")
  
  const valueDebounced = useDebounce(value, 600)

  const queryEnabled = valueDebounced.length > 2

  const query = useGradeShareFilterByEmailQuery(valueDebounced, queryEnabled)

  const handleValue = (e) => {
    setValue(e.target.value)
  }

  return (
    <>
      <label className='text-sm text-muted-foreground'>Search your List of contacts and select</label>
      <div className='sticky top-3 left-0'>
        <SearchIcon className='absolute top-3 left-3 w-4 h-4 text-muted-foreground' />
        <Input 
          value={value} 
          placeholder="Email address..." 
          onChange={handleValue}
          className={cx("pl-9", { 'shadow-md': query.data.length > 0 })}
        />
        {query.isFetching && <Loader2 className='animate-spin absolute right-2 top-2' />}
      </div>
      {query.data.length > 0 ? (
        <div className='space-y-2'>
          {query.data.map(item => (
            <Selection
              key={item.id} 
              onClick={() => onConfirm(item)}
              disabled={item.can_send === 0}
              hoverOverlayText={
                item.can_send === 0 &&
                  <HoverOverlayWarningText 
                    text="You or another agency shared this property already" 
                  />
              }
            >
              {item.email}
            </Selection>
          ))}
        </div>
      ) : (
        <>
          <p className='text-sm'>
            {queryEnabled ? (
              <span className='text-muted-foreground'>You have are no matches for {valueDebounced}</span>
            ) : (
                <span className='space-x-1'>
                  <span className='mr-1 text-muted-foreground opacity-80'>or</span>
                  <Link to="create-new" className='text-sky-700 hover:underline space-x-1'>
                    <span>
                      add contact to CRM and share
                    </span>
                    <ArrowRight className='inline-block w-3 h-3' />
                  </Link>
                </span>
              )
            }
          </p>
          {queryEnabled && (
            <Button  
              variant="default" 
              asChild
            >
              <Link to="create-new" state={{ defaultEmail: valueDebounced }}>
                Add contact
              </Link>
            </Button>
          )}
          <div className='flex items-center justify-center h-20'>
            <Button variant="outline" size="sm" asChild>
              <a href={BASEPATH} target={WINDOWN_NAMES.auth} className='space-x-3'>
                <span className='text-xs'>
                  open CRM 
                </span>
                <ExternalLink className='w-3 h-3' />
              </a>
            </Button>
          </div>
        </>
      )}
    </>
  )
}