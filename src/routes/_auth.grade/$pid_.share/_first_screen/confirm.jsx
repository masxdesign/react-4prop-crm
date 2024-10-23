import { createFileRoute } from '@tanstack/react-router'
import { useGradeShareContext } from '../../$pid_.share'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, CheckIcon } from 'lucide-react'
import { cx } from 'class-variance-authority'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PopoverAnchor } from '@radix-ui/react-popover'
import Selection from '@/components/Selection'
import { Slot } from '@radix-ui/react-slot'
import { isEqual } from 'lodash'
import { useDebounce } from '@uidotdev/usehooks'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_auth/grade/$pid/share/_first_screen/confirm')({
  component: ConfirmComponent
})

function ConfirmComponent () {
  const { onShare, selected, tag, onTagChange } = useGradeShareContext()

  return (
    <>
      <Selection variant="active">
        {selected?.email}
      </Selection>
      <AssignTagInput value={tag} onChange={onTagChange} />
      <Button onClick={onShare}>Share</Button>
    </>
  )
}

const tags = [
  { id: 1, name: "London houses" },
  { id: 10, name: "London houses for sale" },
  { id: 2, name: "Stoke barn conversions" },
  { id: 3, name: "Berlin open storages" },
  { id: 4, name: "France retails" },
  { id: 5, name: "Japan flats" },
]

const containsCombiner = (item, value) => {
  return item.name.trim().toLowerCase().includes(value.trim().toLowerCase())
}

const equalsCombiner = (item, value) => {
  return item.name.trim().toLowerCase() === value.trim().toLowerCase()
}

function AssignTagInput ({ value: controlledValue, onChange }) {

  const inputRef = useRef()

  const [open, setOpen] = useState(false)
  const [_value, setValue] = useState(controlledValue?.name ?? "")
  const [filtered, setFiltered] = useState([])

  useEffect(() => {

    if (controlledValue) {
      setValue(controlledValue.name)
    }

  }, [controlledValue])

  const value = useDebounce(_value, 500)

  useEffect(() => {

    let filtered = tags.filter(item => containsCombiner(item, value))

    if (!!value && !filtered.some(item => equalsCombiner(item, value))) {
      filtered = [{ id: -1, name: value.trim() }, ...filtered]
    }

    setFiltered(filtered)

    const selected = filtered.find(item => equalsCombiner(item, value))

    onChange(selected)

  }, [value])

  const handleChange = (e) => {
    setValue(e.target.value)
  }
  
  const handleToggle = () => {
    setOpen(prev => !prev)
  }

  const handleInputClick = () => {
    setOpen(true)
  }

  const handleSelect = (item) => {
    setValue(item.name)
    setOpen(false)
  }

  const handleOutside = (e) => {
    if (e.target.closest('.anchor')) {
      e.preventDefault()
    }
  }

  useEffect(() => {

    if (open) {
      inputRef.current?.focus()
    }

  }, [open])

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className='flex relative border rounded-md anchor'>
            {_value.length < 1 || open ? (
              <Input 
                ref={inputRef}
                placeholder="Assign a tag" 
                className="border-0 z-0 relative" 
                value={_value}
                onChange={handleChange} 
                onClick={handleInputClick}
              />
            ) : (
              <div className='h-[40px] flex items-center px-3 grow' onClick={handleInputClick}>
                <Badge variant="secondary">
                  {_value}
                </Badge>
              </div>
            )}
            <div className='absolute right-3 top-3 z-10 '>
              <Slot onClick={handleToggle} className='text-slate-500 w-4 h-4'>
                {open ? (
                  <ArrowUp />
                ) : (
                  <ArrowDown />
                )}
              </Slot>
            </div>
          </div>
        </PopoverAnchor>
        <PopoverContent 
          style={{ width: "var(--radix-popper-anchor-width)" }} 
          onOpenAutoFocus={(e) => e.preventDefault()}
          onFocusOutside={handleOutside}
          onPointerDownOutside={handleOutside}
        >
          <div className='space-y-3'>
            {filtered.map(item => (
              <Selection 
                key={item.id} 
                variant={
                  item.id < 0 ? 
                    "blank"
                  : equalsCombiner(item, value) ?
                    "active"
                  :
                    "default"
                } 
                onClick={() => handleSelect(item)}
              >
                {item.name}
              </Selection>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}