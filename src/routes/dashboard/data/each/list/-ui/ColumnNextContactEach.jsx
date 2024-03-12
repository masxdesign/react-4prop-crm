import { addNextContact } from '@/api/fourProp';
import ColumnNextContact from '@/routes/dashboard/-ui/ColumnNextContact';
import { util_add, util_pagin_update } from '@/utils/localStorageController';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ColumnNextContactEach = ({ placeholder = "Pick a date", name = "next_contact", info, onSuccess }) => {
    const queryClient = useQueryClient()
  
    const { id } = info.row.original
  
    const { dataQueryKey } = info.table.options.meta
  
    const mutation = useMutation({
      mutationFn: (variables) => addNextContact(variables, { id }),
      onSuccess: (data, variables) => {
        queryClient.setQueryData(dataQueryKey, util_pagin_update({ id }, variables))
        queryClient.setQueryData(['chatboxEach', id], util_add(data))
        onSuccess && onSuccess()
      }
    })

    return (
      <ColumnNextContact 
        name={name}
        info={info}
        placeholder={placeholder}
        mutation={mutation}
      />
    )
}

export default ColumnNextContactEach