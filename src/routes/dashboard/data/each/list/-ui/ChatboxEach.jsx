import { useCallback } from "react"
import { deleteLog } from "@/api/api-fakeServer"
import Chatbox from "@/routes/dashboard/-ui/Chatbox"
import { format } from "date-fns"
import { addNote, fetchNotes } from "@/api/fourProp"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/Auth/Auth-context"

const NEXT = "2", LAST = "1", NEXT_ONLY = "3", NO_NEXT = "4"

const ChatboxEach = ({ info }) => {
    const { user } = useAuth()
    const { id } = info.row.original

    const queryOptions = {
      queryKey: ['chatboxEach', id],
      queryFn: () => fetchNotes({ id })
    }
  
    const addFn = useCallback((variables) => addNote(variables, { id }), [id])

    const handleFilterData = useCallback((data) => {
      const [messages, branch, privateNotes] = data

      return messages.map((item) => {
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
                {[NEXT, LAST].includes(i2) && body !== '' && (
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
              <span className="flex flex-col items-start pt-2">
                  <span className="mb-3 font-thin">
                      {teaser}
                  </span>
                  <Button size="sm" asChild>
                    <a
                      target="_blank"
                      className="flex items-center gap-2"
                      href={`/bizchat/rooms/${i}?i=${user.bz_hash}`}
                    >
                      Bizchat
                    </a>
                  </Button>
              </span>
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
    }, [])

    return (
      <Chatbox 
          queryOptions={queryOptions} 
          onFilterData={handleFilterData}
          info={info} 
          addFn={addFn}
          deleteFn={deleteLog}
      />  
    )
}

export default ChatboxEach