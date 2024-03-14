import { Suspense, useCallback } from "react"
import { deleteLog } from "@/api/api-fakeServer"
import Chatbox from "@/routes/dashboard/-ui/Chatbox"
import { format } from "date-fns"
import { addNote, fetchNotes } from "@/api/fourProp"
import { Button } from "@/components/ui/button"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { util_add_each, util_delete_each } from "@/utils/localStorageController"
import { getBizchatMessagesLast5 } from "@/api/bizchat"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { CollapsibleTrigger } from "@radix-ui/react-collapsible"

const NEXT = "2", LAST = "1", NEXT_ONLY = "3", NO_NEXT = "4"

const ChatboxEach = ({ queryOptions, info, user }) => {
    const { id } = info.row.original

    const queryClient = useQueryClient()

    const addMutationOptions =  {
      mutationFn: (variables) => addNote(variables, { id, user }),
      onSuccess: (data, variables) => {
        const { _button } = variables
        
        if(_button === 'bizchat') {
          queryClient.invalidateQueries({ queryKey: ['bizchatMessagesLast5', user.id] })
        }
        
        queryClient.setQueryData(queryOptions.queryKey, util_add_each(data))
      }
    }

    const deleteMutationOptions = {
      mutationFn: deleteLog,
      onSuccess: (_, id) => {
        queryClient.setQueryData(queryOptions.queryKey, util_delete_each({ id }))
      }
    }

    const handleFilterData = useCallback((data) => {
      const [messages_, branch, privateNotes] = data

      const messages = messages_.map((item) => {
        const { id, resource_name, d, i, body, i2, created } = item
  
        let message

        const created_ = (
          <span className="absolute bottom-1 right-2 text-xs text-nowrap opacity-40 font-thin">
            {format(created, "d MMM yyy")}
          </span>
        )
  
        switch (true) {
          case resource_name.includes(':c') : {
            message = (
              <>
                {[NEXT, LAST, NO_NEXT].includes(i2) && body !== '' && (
                  <div className="border-b pb-2 font-thin">
                    {body}
                  </div>
                )}
                <span className="flex flex-row gap-2 mb-1">
                  {{
                    [LAST]: "Last contact",
                    [NEXT]: "Next contact",
                    [NEXT_ONLY]: (
                      <span className="space-x-1">
                          <span>Next contact</span>                          
                          <i className="text-muted-foreground">updated</i>
                      </span>
                    ),
                    [NO_NEXT]: (
                      <span className="space-x-2">
                        <span>Next contact</span>
                        <span className="font-bold">no date</span>
                      </span>
                    )
                  }[i2]}
                  {[NEXT, LAST, NEXT_ONLY].includes(i2) && (
                    <span className="font-bold">
                      {format(d, "d MMM yyy")}
                    </span>
                  )}
                </span>
                {created_}
              </>
            )
            break
          }
          case resource_name.includes(':bz') : {
            const { teaser } = JSON.parse(body)
  
            message = (
              <>
                <span className="flex flex-col items-start gap-1 mb-2">
                  <span className="text-muted-foreground text-xs">Bizchat message</span>
                  <span className="font-bold min-w-[180px]">
                      {teaser}
                  </span>
                  <Collapsible>
                    <CollapsibleContent>
                      <Suspense fallback={<p>Loading...</p>}>
                        <LoadBizchatMessagesLast5 
                          senderUserId={user.id}
                          chatId={i}
                        />
                      </Suspense>
                    </CollapsibleContent>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">View last 5 messages</Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                  <Button variant="secondary" size="sm" className="w-full" asChild>
                    <a
                      target="_blank"
                      className="flex bg-emerald-500 hover:bg-emerald-400 text-white items-center gap-2"
                      href={`/bizchat/rooms/${i}?i=${user.bz_hash}`}
                    >
                      View and reply
                    </a>
                  </Button>
                </span>
                {created_}
              </>
            )

            break
          }
          default:
            message = (
              <>
                <span className="font-thin mb-1">
                  {body}
                </span>
                {created_}
              </>
            )
        }

        return {
          id,
          message
        }
      })

      return messages
    }, [])

    return (
      <Chatbox 
        queryOptions={queryOptions} 
        onFilterData={handleFilterData}
        addMutationOptions={addMutationOptions}
        deleteMutationOptions={deleteMutationOptions}
        enableDelete={false}
      />  
    )
}

function LoadBizchatMessagesLast5 ({ senderUserId, chatId }) {

  const { data, refetch } = useSuspenseQuery({
    queryKey: ['bizchatMessagesLast5', senderUserId, chatId],
    queryFn: () => getBizchatMessagesLast5({ senderUserId, chatId }),
    staleTime: Infinity
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="min-w-[300px] space-y-2">
        {data.map(({ id, body}) => (
          <div key={id} className="rounded-md border p-2 text-xs">{body}</div>
          ))}
      </div>
      <Button variant="secondary" size="xs" onClick={refetch}>Reload</Button>
    </div>
  )
}

export default ChatboxEach