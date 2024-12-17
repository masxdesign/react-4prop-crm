import { ArrowDown, ArrowUp, CheckIcon, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent } from '@/components/ui/popover'
import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { PopoverAnchor } from '@radix-ui/react-popover'
import Selection from '@/components/Selection'
import { Slot } from '@radix-ui/react-slot'
import { useDebounce } from '@uidotdev/usehooks'

const containsCombiner = (item, value) => {
    return item.name.trim().toLowerCase().includes(value.trim().toLowerCase())
}

const equalsCombiner = (item, value) => {
    return item.name.trim().toLowerCase() === value.trim().toLowerCase()
}

const AssignTagInputScrollList = React.forwardRef(({ placeholder, list, selected, onSelect }, ref) => {
    const inputRef = useRef(null)
  
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
  
    const debouncedValue = useDebounce(value, 400)
  
    const filtered = useMemo(() => {
  
      let newFiltered = list.filter(item => containsCombiner(item, debouncedValue))
  
      if (!!debouncedValue && !newFiltered.some(item => equalsCombiner(item, debouncedValue))) {
        return [{ id: -1, name: debouncedValue.trim() }, ...newFiltered]
      }
  
      return newFiltered
  
    }, [list, debouncedValue])
  
    const handleChange = (e) => {
      setValue(e.target.value)
    }
  
    const handleInputClick = () => {
      setOpen(true)
    }

    useImperativeHandle(ref, () => {
      return {
        focus: () => {
          setOpen(true)
        }
      }
    }, [setOpen])
  
    const handleSelect = item => {
      onSelect(item)
      setValue(item.name)
      setOpen(false)
    }
  
    const handleOutside = (e) => {
      if (e.target.closest('.anchor')) {
        e.preventDefault()
      }
    }

    useEffect(() => {

      if (selected) {
        setValue(selected.name)
      }

    }, [selected])
  
    useEffect(() => {
  
      if (open) {
        inputRef.current?.focus()
      }
  
    }, [open])
  
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
          setOpen(false)
      }
  }
  
    const getVariant = (item, prefix = '') => {
      return (!prefix ? '': `${prefix}-`) + (
        item.id < 0 ? 
          "plus"
        : equalsCombiner(item, value) ?
          "active"
        :
          "default"
      )
    }

    let total = filtered.length === list.length
      ? list.length 
      : `${filtered.length}/${list.length}`

    if (filtered.length === 1) {
      total = list.length
    }
  
    return (
      <>
        {value.length < 1 || open ? (
          <Input 
            ref={inputRef}
            placeholder={placeholder}
            className="z-0 relative pr-[40px]" 
            value={value}
            onChange={handleChange} 
            onKeyPress={handleKeyPress}
            onClick={handleInputClick}
          />
        ) : (
          <div className='p-1 grow overflow-hidden h-[40px]' onClick={handleInputClick}>
            {selected ? (
              <Selection variant={getVariant(selected, 'outline')} size="sm" className="inline-flex py-auto h-full">
                {selected.name}
              </Selection>
            ) : (
              <Loader2 className='animate-spin' />
            )}
          </div>
        )}
        <div className='space-y-2'>
          <h3 className='px-1 space-x-1'>
            <span className='text-xs font-bold'>Search references</span>
            <span className='text-xs font-normal text-muted-foreground'>{total}</span>
          </h3>
          <div className='h-[300px] space-y-2 overflow-y-auto'>
            {filtered.map(item => (
              <Selection 
                key={item.id} 
                variant={getVariant(item)} 
                onClick={() => handleSelect(item)}
                size="sm"
              >
                {item.name}
              </Selection>
            ))}
          </div>
        </div>
      </>
    )
})

export default AssignTagInputScrollList