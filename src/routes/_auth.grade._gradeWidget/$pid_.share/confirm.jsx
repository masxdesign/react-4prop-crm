import { createFileRoute, Link, useMatch, useMatchRoute, useRouterState } from '@tanstack/react-router'
import { useGradeShareContext } from '.'
import { Button } from '@/components/ui/button'
import { ArrowDown, ArrowUp, CheckIcon, Loader2 } from 'lucide-react'
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
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_auth/grade/_gradeWidget/$pid/share/confirm')({
  component: ConfirmComponent
})

function ConfirmComponent () {
  const { onShare, selected, tag, onTagChange, tagListQueryOptions } = useGradeShareContext()

  const list = useQuery(tagListQueryOptions)

  const { location } = useRouterState()

  const matchRoute = useMatchRoute()

  const match = matchRoute({ to: "/_auth/grade/_gradeWidget/231020182546/share/confirm", params: { pid: '231020182546' } })

  console.log(match);
  

  return (
    <div className='space-y-3'>
      <div className='flex gap-2 items-center'>
          <h2 className='font-bold text-md space-x-3'>
              <span>Send this property to?</span>
              <span className='inline-block px-2 py-1 font-bold bg-yellow-300 text-orange-800 rounded-sm text-xs'>crm</span>
          </h2>
          <Button variant="secondary" size="xs" className="ml-auto" asChild>
              <Link to=".." from={location.pathname}>
                  Change
              </Link>
          </Button>
      </div>
      <div className='space-y-1'>
        <Selection variant="active">
          {selected?.email}
        </Selection>
      </div>
      <div className='space-y-1'>
        <label className="text-sm font-bold">Assign a group tag to this property</label>
        {list.isFetching ? (
          <Loader2 className='animate-spin' />
        ) : (
          <AssignTagInput list={list.data} value={tag} onChange={onTagChange} />
        )}
      </div>
      <Button onClick={onShare} disabled={!tag}>Share</Button>
    </div>
  )
}

const containsCombiner = (item, value) => {
  return item.name.trim().toLowerCase().includes(value.trim().toLowerCase())
}

const equalsCombiner = (item, value) => {
  return item.name.trim().toLowerCase() === value.trim().toLowerCase()
}

function AssignTagInput ({ list, value: controlledValue, onChange }) {

  const inputRef = useRef()

  const [open, setOpen] = useState(false)
  const [_value, setValue] = useState(controlledValue?.name ?? "")

  useEffect(() => {

    if (controlledValue) {
      setValue(controlledValue.name)
    }

  }, [controlledValue])

  const value = useDebounce(_value, 400)

  const filtered = useMemo(() => {

    let newFiltered = list.filter(item => containsCombiner(item, value))

    if (!!value && !newFiltered.some(item => equalsCombiner(item, value))) {
      return [{ id: -1, name: value.trim() }, ...newFiltered]
    }

    return newFiltered

  }, [list, value])

  const selected = useMemo(
    () => filtered.find(item => equalsCombiner(item, _value)), 
    [filtered, _value]
  )

  useEffect(() => {

    onChange(selected)

  }, [selected])

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
        setOpen(false)
    }
}

  const getVariant = (item, prefix = '') => {
    return (!prefix ? '': `${prefix}-`) + (
      item.id < 0 ? 
        "plus"
      : equalsCombiner(item, _value) ?
        "active"
      :
        "default"
    )
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className='flex relative border rounded-md anchor'>
            {_value.length < 1 || open ? (
              <Input 
                ref={inputRef}
                placeholder="Existing or new tag *" 
                className="border-0 z-0 relative pr-[40px]" 
                value={_value}
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
            <div className='absolute top-0 right-0 p-3 z-10 bg-white rounded-md' onClick={handleToggle}>
              <Slot className='text-slate-500 w-4 h-4'>
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
          className="max-h-[50svh] overflow-auto p-2"
          style={{ width: "var(--radix-popper-anchor-width)" }} 
          onOpenAutoFocus={(e) => e.preventDefault()}
          onFocusOutside={handleOutside}
          onPointerDownOutside={handleOutside}
        >
          <div className='space-y-2'>
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
        </PopoverContent>
      </Popover>
    </>
  )
}