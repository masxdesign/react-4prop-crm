import { addNextContact } from '@/api/fourProp';
import ColumnNextContact from '@/routes/_admin/_with-menu/dashboard/-ui/ColumnNextContact';
import useContactDateMutationOptions from './use-ContactDateEachMutationOptions';

const ColumnNextContactEach = ({ placeholder = "Pick a date", name = "next_contact", info, onSuccess, message }) => {
    const mutationOptions = useContactDateMutationOptions({ info, mutationFn: addNextContact, onSuccess })

    return (
      <ColumnNextContact 
        name={name}
        info={info}
        message={message}
        placeholder={placeholder}
        mutationOptions={mutationOptions}
      />
    )
}

export default ColumnNextContactEach