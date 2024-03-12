import { addLastContact } from '@/api/fourProp';
import ColumnLastContact from '@/routes/dashboard/-ui/ColumnLastContact';
import { util_add, util_pagin_update } from '@/utils/localStorageController';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ColumnLastContactEach = ({ variant, name = "last_contact", info, onSuccess }) => {
    const queryClient = useQueryClient()
  
    const { id } = info.row.original
  
    const { dataQueryKey } = info.table.options.meta
  
    const mutation = useMutation({
      mutationFn: (variables) => addLastContact(variables, { id }),
      onSuccess: (data, variables) => {
        queryClient.setQueryData(dataQueryKey, util_pagin_update({ id }, variables))
        queryClient.setQueryData(['chatboxEach', id], util_add(data))
        onSuccess && onSuccess()
      }
    })
  
    return (
      <ColumnLastContact 
        variant={variant}
        name={name}
        info={info}
        mutation={mutation}
      />
    )
}

export default ColumnLastContactEach