import { deleteLog } from "@/api/api-fakeServer"
import { useQueryClient } from "@tanstack/react-query"
import { addNote } from "@/api/fourProp"
import { util_delete_each } from "@/utils/localStorageController"
import { useRenderMessage } from "@/components/CRMTable/hooks"
import Chatbox from "./Chatbox"

const ChatboxEach = ({ queryOptions, id, user }) => {
    const queryClient = useQueryClient()

    const renderMessage = useRenderMessage()

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
        renderMessage={renderMessage}
        addMutationOptions={addMutationOptions}
        deleteMutationOptions={deleteMutationOptions}
        enableDelete={false}
      />  
    )
}

export default ChatboxEach