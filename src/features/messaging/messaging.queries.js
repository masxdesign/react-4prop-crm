import { getBizchatMessagesLast5, getBizchatMessagesLastN } from "@/services/bizchat";
import { queryOptions } from "@tanstack/react-query";

export const bizchatMessagesLast5Query = (authUserId, chatId) => queryOptions({
    queryKey: ["bizchatMessagesLast5", authUserId, chatId],
    queryFn: () => getBizchatMessagesLast5({ authUserId, chatId })
})

export const bizchatMessagesLastNQuery = (authUserId, chatId, limit) => queryOptions({
    queryKey: ["bizchatMessagesLastN", authUserId, chatId, limit],
    queryFn: () => getBizchatMessagesLastN({ authUserId, chatId, limit })
})