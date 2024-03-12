import LastContact from './LastContact';
import { useMutation } from '@tanstack/react-query';

const ColumnContactDate = ({ variant, name = "last_contact", info, mutationOptions }) => {

    const value = info.row.getValue(name)
  
    const mutation = useMutation(mutationOptions)
    
    const handleSelect = () => {
      mutation.mutate({ [name]: new Date })
    }
   
    const handleClear = () => {
      mutation.mutate({ [name]: null })
    }
  
    if(mutation.isPending) return <small className='text-muted-foreground flex items-center h-[46px]'>Saving...</small>
  
    return (
      <LastContact 
        variant={variant}
        value={value}
        onSelect={handleSelect}
        onClear={handleClear}
      />
    )
}

export default ColumnContactDate