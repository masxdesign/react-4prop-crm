import { Suspense, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useChatbox from '@/hooks/use-Chatbox';
import { useSuspenseQuery } from '@tanstack/react-query';
import ChatboxMessages from './ChatboxMessages';

const FetchChatboxMessages = ({ queryOptions, onFilterData, enableDelete, ...props }) => {
  const query = useSuspenseQuery(queryOptions)

  const messages = useMemo(() => onFilterData(query.data), [query.data, onFilterData])

  return messages.length > 0 ? (
    <ChatboxMessages 
      data={messages}
      enableDelete={enableDelete}
      {...props}
    />
  ) : (
    <div className='uppercase opacity-50 font-bold text-sm text-slate-400 w-full h-full flex justify-center items-center'>
      No messages
    </div>
  )
}

const Chatbox = ({ 
  queryOptions, 
  onFilterData, 
  deleteMutationOptions, 
  addMutationOptions,
  enableDelete
}) => {
    const {
      chatBoxProps,
      messageBoxProps,
      submit,
      error
    } = useChatbox({ queryOptions, deleteMutationOptions, addMutationOptions })
  
    return (
      <div className='flex flex-col h-full'>
        <div className="bg-slate-100 shadow-inner h-full min-h-[420px] max-h-[600px]">
          <Suspense fallback={<p className='opacity-50 text-sm p-3'>Loading...</p>}>
            <FetchChatboxMessages 
              queryOptions={queryOptions}
              onFilterData={onFilterData}
              className="h-full"
              enableDelete={enableDelete}
              {...chatBoxProps}
            />
          </Suspense>
        </div>
        <div className='bg-white border-t'>
          <div className='relative'>
            <Textarea 
              placeholder="Type your message here."
              className="border-none bg-transparent resize-none"
              {...messageBoxProps}
            />
            {error && <small className='text-red-500 absolute right-2 top-2'>{error}</small>}
          </div>
          <div className="flex flex-row gap-4 justify-end items-center py-2 px-3">
            <Button variant="default" size="xs" onClick={submit} name="note">Make note</Button>
            <Button variant="secondary" size="xs" onClick={submit} name="bizchat">Send Bizchat</Button>
          </div>
        </div>
      </div>
    )
}

export default Chatbox