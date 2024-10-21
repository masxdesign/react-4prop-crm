import { useState } from 'react'
import { useAuth } from '@/components/Auth/Auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { crmFilterByEmail } from '@/services/bizchat'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useDebounce } from '@uidotdev/usehooks'
import { cx } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

export const Route = createLazyFileRoute('/_auth/_grade/integrate-grade-share/')({
  component: IntegrateGradingComponent
})

const initialFiltered = []

function IntegrateGradingComponent () {

  const auth = useAuth()
  
  const [value, setValue] = useState("")
  
  const valueDebounced = useDebounce(value, 600)

  const queryEnabled = valueDebounced.length > 2

  const query = useQuery(queryOptions({
    queryKey: ['filterByEmail', auth.authUserId, valueDebounced],
    queryFn: () => crmFilterByEmail(auth.authUserId, valueDebounced),
    enabled: queryEnabled,
    initialData: initialFiltered
  }))

  const handleValue = (e) => {
    setValue(e.target.value)
  }

  return (
    <div className='flex flex-col gap-3 max-w-[400px]'>
      <div className='sticky top-3 left-0'>
        <Input 
          value={value} 
          placeholder="Email address..." 
          onChange={handleValue}
        />
        {query.isFetching && <Loader2 className='animate-spin absolute right-2 top-2' />}
      </div>
      {query.data.length < 1 && (
        <div className='text-xs px-3 text-muted-foreground'>
          {queryEnabled ? 
            "There are no matches"
            : (
              <>
                Select from your client list or <Link to="create-new">add new client</Link>
              </>
            )
          }
        </div>
      )}
      {query.data.map(item => (
        <Button 
          key={item.id} 
          variant="outline"
          asChild
        >
          <Link to="existing" state={{ selected: item }}>
            {item.email}
          </Link>
        </Button>
      ))}
      {queryEnabled && query.data.length < 1 && (
        <Button  
          variant="default" 
          asChild
        >
          <Link to="create-new" state={{ defaultEmail: valueDebounced }}>
            add new client
          </Link>
        </Button>
      )}
    </div>
  )
}