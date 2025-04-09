import { useEffect, useRef, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/Auth/Auth'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { searchReferenceListingEnquiredQuery } from '../searchReference.queries'
import AssignTagInputScrollList from '@/features/tags/components/AssignTagInputScrollList'
import { Button } from '@/components/ui/button'
import { ChevronDown, Edit3 } from 'lucide-react'
import { useGradeUpdater } from '../searchReference.mutation'
import useSearchReferenceListingEnquired from '../searchReference.hooks'
import SearchReferenceButton from './SearchReferenceButton'

function SearchReferenceSelect({ tag_id, pid, onSelect, isAgent, onClick, className }) {
    const inputRef = useRef(null)
    const [open, setOpen] = useState(false)

    const { data, refetch } = useSearchReferenceListingEnquired()

    const handleOpen = () => {
      setOpen(true)
    }
  
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

    const gradeUpdater = useGradeUpdater(pid)
  
    const handleSelect = async (tag) => {
      const { new_tag_id = null } = await gradeUpdater.mutateAsync({ tag })

      let newTag = tag

      if (new_tag_id !== null) {
        newTag = { ...newTag, id: `${new_tag_id}` }
      }

      onSelect?.(newTag)
      setSelected(newTag)
      setOpen(false)

      if (new_tag_id !== null) {
        refetch()
      }

    }

    const handleClick = () => {
      onClick?.(selected)
    }
  
    return (
      <>
        <SearchReferenceButton className={className}>
          <div className='px-2 py-1 flex-1 hover:underline' onClick={handleClick}>
              {selected ? selected.name: "Unnamed"}
          </div>
          {!isAgent && (
            <div onClick={handleOpen} className='flex items-center justify-center px-2 border-l border-l-sky-200 bg-sky-50 hover:bg-sky-500 hover:text-white ml-auto'>
              <ChevronDown className='size-3 ml-auto' />
            </div>
          )}
        </SearchReferenceButton>
        <Dialog open={open} onOpenChange={setOpen}>
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
      </>
    )
}

export default SearchReferenceSelect