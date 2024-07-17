import { deleteLog } from "@/api/api-fakeServer"
import Chatbox from "@/routes/-ui/Chatbox"
import { addNote } from "@/api/fourProp"
import { useQueryClient } from "@tanstack/react-query"
import { util_add_each, util_delete_each } from "@/utils/localStorageController"
import useChatboxEachFilterMessages from "./use-chatboxEachFilterMessages"

const ChatboxEach = ({ queryOptions, id, user }) => {
    const queryClient = useQueryClient()

    const handleFilterMessages = useChatboxEachFilterMessages()

    const addMutationOptions =  {
      mutationFn: (variables) => addNote(variables, { id, user }),
      onSuccess: (data, variables) => {
        const { _button } = variables
        
        if(_button === 'bizchat') {
          queryClient.invalidateQueries({ queryKey: ['bizchatMessagesLast5', user.neg_id] })
        }
        
        queryClient.invalidateQueries({ queryKey: queryOptions.queryKey })
      }
    }

    /** experimental */
    const deleteMutationOptions = {
      mutationFn: deleteLog,
      onSuccess: (_, id) => {
        queryClient.setQueryData(queryOptions.queryKey, util_delete_each({ id }))
      }
    }

    return (
      <Chatbox 
        queryOptions={queryOptions} 
        onFilterData={handleFilterMessages}
        addMutationOptions={addMutationOptions}
        deleteMutationOptions={deleteMutationOptions}
        enableDelete={false}
      />  
    )
}

export default ChatboxEach