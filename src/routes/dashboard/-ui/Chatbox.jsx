import { Suspense, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import LogChatbox from './LogChatbox';
import useChat from '@/hooks/use-chat';
import { useSuspenseQuery } from '@tanstack/react-query';

const ChatboxMessages = ({ queryOptions, onFilterData, ...props }) => {
  const query = useSuspenseQuery(queryOptions)

  const messages = useMemo(() => onFilterData(query.data), [query.data, onFilterData])

  return messages.length > 0 ? (
    <LogChatbox 
      data={messages}
      {...props}
    />
  ) : (
    <div className='opacity-50 font-bold text-lg text-slate-400 w-full h-full flex justify-center items-center'>
      No messages yet
    </div>
  )
}

const Chatbox = ({ 
  info, 
  queryOptions, 
  onFilterData, 
  deleteFn, 
  addFn, 
  lastContactComponent: LastContactComponent,
  nextContactComponent: NextContactComponent
}) => {
    const {
      chatBoxProps,
      messageBoxProps,
      submit,
      resetScroll,
      error
    } = useChat({ queryOptions, deleteFn, addFn })
  
    return (
      <>
        <div className="h-[500px] bg-slate-100 shadow-inner">
          <Suspense fallback={<p className='opacity-50 text-sm p-3'>Loading...</p>}>
            <ChatboxMessages 
              queryOptions={queryOptions}
              onFilterData={onFilterData}
              className="h-full"
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
          <div className="flex flex-row gap-4 justify-between items-center py-2 px-3">
            <LastContactComponent info={info} onSuccess={resetScroll} />
            <Button variant="default" size="xs" onClick={submit}>Make note</Button>
            <NextContactComponent placeholder="Next contact" info={info} onSuccess={resetScroll} />
          </div>
        </div>
      </>
    )
}

export default Chatbox