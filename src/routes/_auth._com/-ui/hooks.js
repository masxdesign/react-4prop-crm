import { useSuspenseQuery } from "@tanstack/react-query"
import { bizchatMessagesLastNQuery } from "@/features/messaging/messaging.queries"
import { createSelector } from "reselect"
import { chain, last } from "lodash"

const default_lastN_limit = 1

export const useMessagesLastNList = (bzUserId, chat_id, select) => {
  const options = bizchatMessagesLastNQuery(bzUserId, chat_id, default_lastN_limit)
  const { data } = useSuspenseQuery({
    ...options,
    select
  })
  return data
}

const selectLastMessage = state => last(state)

export const selectReplyTo = createSelector(
  selectLastMessage,
  (_, bzUserId) => bzUserId,
  (lastMessage, bzUserId) => {
    if (!lastMessage) return null

    const { recipients, from } = lastMessage

    const uids = chain(`${from},${recipients}`)
      .trim(',')
      .split(',')
      .uniq()
      .filter(id => id !== bzUserId)
      .value()

    return uids

  }
)