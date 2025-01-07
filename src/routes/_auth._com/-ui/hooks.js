import { useSuspenseQuery } from "@tanstack/react-query"
import { bizchatMessagesLastNQuery } from "@/features/messaging/messaging.queries"
import { useAuth } from "@/components/Auth/Auth"
import { createSelector } from "reselect"
import { chain, last } from "lodash"

const default_lastN_limit = 1

export const useMessagesLastNList = (chat_id, select) => {
  const auth = useAuth()
  const options = bizchatMessagesLastNQuery(auth.authUserId, chat_id, default_lastN_limit)
  const { data } = useSuspenseQuery({
    ...options,
    select
  })
  return data
}

const selectLastMessage = state => last(state)

export const selectReplyTo = createSelector(
  selectLastMessage,
  (_, authUserId) => authUserId,
  (lastMessage, authUserId) => {
    if (!lastMessage) return null

    const { recipients, from } = lastMessage

    const uids = chain(`${from},${recipients}`)
      .trim(',')
      .split(',')
      .uniq()
      .filter(uid => uid !== authUserId)
      .value()

    return uids

  }
)