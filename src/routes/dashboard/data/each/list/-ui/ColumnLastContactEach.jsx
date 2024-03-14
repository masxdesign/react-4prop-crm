import { addLastContact } from '@/api/fourProp';
import ColumnLastContact from '@/routes/dashboard/-ui/ColumnLastContact';
import useContactDateEachMutationOptions from './use-ContactDateEachMutationOptions';

const ColumnLastContactEach = ({ variant, name = "last_contact", info, onSuccess, message }) => {
   const mutationOptions = useContactDateEachMutationOptions({ info, mutationFn: addLastContact, onSuccess })
  
    return (
      <ColumnLastContact 
        variant={variant}
        name={name}
        message={message}
        info={info}
        mutationOptions={mutationOptions}
      />
    )
}

export default ColumnLastContactEach