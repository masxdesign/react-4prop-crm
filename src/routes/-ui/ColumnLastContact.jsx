import { useState } from 'react';
import LastContact from './LastContact';
import { useMutation } from '@tanstack/react-query';
import UpdateValueWhenTableChanges from './UpdateValueWhenTableChanges';

const ColumnLastContact = ({ variant, id, name = "last_contact", defaultValue, table = null, mutationOptions, clear, message = '' }) => {
    const [value, setValue] = useState(defaultValue)

    const mutation = useMutation(mutationOptions)
    
    const handleSelect = () => {
      mutation.mutate({ [name]: new Date().toJSON(), message })
    }
   
    const handleClear = () => {
      mutation.mutate({ [name]: null, message })
    }
    
    if(mutation.isPending) return <small className='text-muted-foreground flex items-center h-[46px]'>Saving...</small>
  
    return (
      <>
        {table && (
          <UpdateValueWhenTableChanges
            id={id} 
            table={table} 
            name={name} 
            onChange={setValue} 
          />
        )}
        <LastContact 
          variant={variant}
          value={value}
          onSelect={handleSelect}
          onClear={handleClear}
          clear={clear}
        />
      </>
    )
}

export default ColumnLastContact