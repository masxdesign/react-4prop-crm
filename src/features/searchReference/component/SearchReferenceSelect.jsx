import { useEffect, useRef, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/Auth/Auth-context'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { searchReferenceListingEnquiredQuery } from '../searchReference.queries'
import AssignTagInputScrollList from '@/features/tags/components/AssignTagInputScrollList'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useGradeUpdater } from '../searchReference.mutation'

function SearchReferenceSelect({ tag_id, pid }) {
    const inputRef = useRef(null)
    const [open, setOpen] = useState(false)
    
    const auth = useAuth()
    const { data } = useSuspenseQuery(searchReferenceListingEnquiredQuery(auth.authUserId))
    
    const gradeUpdater = useGradeUpdater(pid)
  
    const [selected, setSelected] = useState(() => {
      return data.find(row => row.id === tag_id)
    })
  
    useEffect(() => {
  
      if (open) {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 200)
      }
  
    }, [open])
  
    const handleSelect = async (tag) => {
      await gradeUpdater.mutateAsync({ tag })
      setSelected(tag)
      setOpen(false)
    }
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>    
          <div className='inline-flex items-center gap-1 bg-white shadow-sm cursor-pointer border border-sky-200 text-sky-500 text-xs rounded px-2 py-1 hover:border-sky-500'>
            <div>
                {selected ? selected.name: "Unnamed"}
            </div>
            <ChevronDown className='size-3 ml-auto' />
          </div>
        </DialogTrigger>
        <DialogContent className="flex gap-4 flex-col justify-center max-w-[450px]">
          <h2 className='font-bold text-lg'>Change search reference</h2>
          <AssignTagInputScrollList 
            ref={inputRef}
            placeholder={selected?.name ?? "Unnamed"}
            list={data} 
            selected={selected}
            onSelect={handleSelect}
          />
          <div className='flex gap-2 items-center self-center'>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
}

export default SearchReferenceSelect