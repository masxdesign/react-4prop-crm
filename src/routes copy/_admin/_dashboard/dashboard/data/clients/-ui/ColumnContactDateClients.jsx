import usePrivateNotesMutation from './use-privateNotesMutation';
import LastContact from './LastContact';

const ColumnContactDateClients = ({ variant, name = "last_contact", info, onSuccess }) => {

    const value = info.row.getValue(name)
  
    const mutation = usePrivateNotesMutation({ name, info, onSuccess })
    
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

export default ColumnContactDateClients