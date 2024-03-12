import { useState } from 'react';
import NextContact from './NextContact';

const ColumnNextContact = ({ placeholder = "Pick a date", name = "next_contact", info, mutation }) => {
    const [open, setOpen] = useState(false)
  
    const value = info.row.getValue(name)
  
    const handleSelect = (dateValue) => {
      mutation.mutate({ [name]: dateValue })
      setOpen(false)
    }
  
    const handleClear = (e) => {
      e.preventDefault()
      mutation.mutate({ [name]: null })
      setOpen(false)
    }
  
    if(mutation.isPending) return <small className='text-muted-foreground flex items-center h-[40px]'>Saving...</small>
  
    return (
      <NextContact 
        open={open}
        value={value}
        placeholder={placeholder}
        onSelect={handleSelect}
        onClear={handleClear}
        onOpenChange={setOpen}
      />
    )
}

export default ColumnNextContact