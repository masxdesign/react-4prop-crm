import { getBizchatMessagesLast5, getBizchatMessagesLastN } from "@/services/bizchat";
import { queryOptions } from "@tanstack/react-query";

export const bizchatMessagesLast5Query = (authBzId, chatId) => queryOptions({
    queryKey: ["bizchatMessagesLast5", authBzId, chatId],
    queryFn: () => getBizchatMessagesLast5({ authBzId, chatId })
})

export const bizchatMessagesLastNQuery = (bzUserId, chatId, limit) => queryOptions({
    queryKey: ["bizchatMessagesLastN", bzUserId, chatId, limit],
    queryFn: () => getBizchatMessagesLastN({ bzUserId, chatId, limit })
})