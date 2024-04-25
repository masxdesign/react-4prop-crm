import { useState } from 'react';
import usePrivateNotesMutation from './use-privateNotesMutation';
import NextContact from './NextContact';

const ColumnNextContactClients = ({ placeholder = "Pick a date", name = "next_contact", info, onSuccess }) => {

    const [open, setOpen] = useState(false)
  
    const value = info.row.getValue(name)
  
    const mutation = usePrivateNotesMutation({ name, info, onSuccess })
  
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

export default ColumnNextContactClients