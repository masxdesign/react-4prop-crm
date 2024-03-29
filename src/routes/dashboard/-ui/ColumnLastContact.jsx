import { useEffect, useRef, useState } from 'react';
import LastContact from './LastContact';
import { useMutation } from '@tanstack/react-query';
import { useIsFirstRender } from '@uidotdev/usehooks';

const ColumnLastContact = ({ variant, name = "last_contact", info, mutationOptions, clear, message = '' }) => {
    const isFirstRender = useIsFirstRender()

    const [value, setValue] = useState(info.row.getValue(name))

    const mutation = useMutation(mutationOptions)
    
    const handleSelect = () => {
      mutation.mutate({ [name]: new Date().toJSON(), message })
    }
   
    const handleClear = () => {
      mutation.mutate({ [name]: null, message })
    }

    useEffect(() => {
      
      if(!isFirstRender) {
        setValue(info.table.getRowModel().rows[info.row.id].getValue(name))
      }

    }, [info.table.options.data])
    
    if(mutation.isPending) return <small className='text-muted-foreground flex items-center h-[46px]'>Saving...</small>
  
    return (
      <LastContact 
        variant={variant}
        value={value}
        onSelect={handleSelect}
        onClear={handleClear}
        clear={clear}
      />
    )
}

export default ColumnLastContact