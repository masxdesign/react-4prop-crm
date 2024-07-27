import { Suspense, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import useChatbox from '@/hooks/use-Chatbox';
import { useSuspenseQuery } from '@tanstack/react-query';
import ChatboxMessages from './ChatboxMessages';
import { ExpandIcon, FileUpIcon, Fullscreen, FullscreenIcon, PaperclipIcon, Send } from 'lucide-react';
import { Dashboard, FileInput, useUppyEvent, useUppyState } from '@uppy/react';
import { Uppy } from '@uppy/core';

import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import { createSelector } from 'reselect';
import { useToast } from '@/components/ui/use-toast';
import { useIsFirstRender, usePrevious } from '@uidotdev/usehooks';
import { PopoverContentWithoutPortal } from '@/components/ui-custom/popover';
import ThumbnailGenerator from '@uppy/thumbnail-generator';

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
      No messages yet
    </div>
  )
}

const filesSelector = createSelector(
  state => state.files,
  (files) => Object.entries(files)
)

const Chatbox = ({ 
  queryOptions, 
  onFilterData, 
  deleteMutationOptions, 
  addMutationOptions,
  enableDelete
}) => {
    const [uppy] = useState(() => new Uppy({
      restrictions: {
        maxNumberOfFiles: 3,
        allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
        maxFileSize: 25_000_000
      }
    }).use(ThumbnailGenerator, { thumbnailWidth: 320, thumbnailType: 'image/png', waitForThumbnailsBeforeUpload: true }))

    const files = useUppyState(uppy, filesSelector)

    const [expand, setExpand] = useState(false)

    const {
      chatBoxProps,
      messageBoxProps,
      submit,
      error
    } = useChatbox({ files, queryOptions, deleteMutationOptions, addMutationOptions })

    const handleExpand = () => {
      setExpand(true)
    }

    const handleMinimise = () => {
      setExpand(false)
    }

    const handleToggle = () => {
      setExpand(prev => !prev)
    }
  
    return (
      <div className='flex flex-col h-full relative'>
        <div className="bg-slate-100 shadow-inner grow min-h-[420px] max-h-[600px]">
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
              placeholder="Type your message here..."
              className="focus-visible:ring-inset focus-visible:ring-offset-0 border-none bg-transparent resize-none"
              {...messageBoxProps}
            />
            {error && <small className='text-red-500 absolute right-2 top-2'>{error}</small>}
          </div>
          <div className="flex flex-row gap-4 justify-end items-center py-2 px-3">
            <span className='flex items-center mr-auto opacity-50 hover:opacity-100 hover:scale-105 transition-all cursor-pointer' onClick={handleToggle}>
              <ExpandIcon className='w-3 h-3 mr-2' />
              <span className='text-xs'>
                {expand ? 'minimise': 'expand'}
              </span>
            </span>
            <Button variant="default" size="xs" onClick={() => submit("note")}>Make note</Button>
            <div className='flex gap-1'>
              <Button variant="secondary" size="xs" onClick={() => submit("bizchat")}>
                <Send className='w-3 h-3 mr-1' />
                message
              </Button>
              <BizchatAttachmentsButton uppy={uppy} />
            </div>
          </div>
        </div>
        {expand && (
          <>
            <div className='absolute inset-0 bg-black opacity-50 bottom-10' onClick={handleMinimise} />
            <div className='absolute bg-white inset-x-0 bottom-10 h-2/3 shadow-lg'>
              <Textarea 
                placeholder="Type your message here..."
                className="focus-visible:ring-inset focus-visible:ring-offset-0 border-none bg-transparent resize-none h-full"
                {...messageBoxProps}
              />
              {error && <small className='text-red-500 absolute right-2 top-2'>{error}</small>}
            </div>
          </>
        )}
      </div>
    )
}

function BizchatAttachmentsButton ({ uppy }) {
  const { toast } = useToast()

  const files = useUppyState(uppy, filesSelector)

  const isFirstRender = useIsFirstRender()
  const previousFilesLength = usePrevious(files.length)

  useEffect(() => {

    if (!isFirstRender && previousFilesLength !== files.length) {

      if (previousFilesLength < files.length) {

        toast({
          title: `Bizchat attachment`,
          description: `${files.length - previousFilesLength} file(s) added`
        })

      } else {

        toast({
          title: `Bizchat attachment`,
          description: `${previousFilesLength - files.length} file(s) removed`
        })

      }

    }

  }, [files])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="xs" className="relative">
          <PaperclipIcon className='text-slate-500 w-4 h-4' />
          {files.length > 0 && (
            <span className='flex absolute -right-2 -top-2 text-[10px] items-center justify-center bg-sky-200 text-sky-500 w-5 h-5 rounded-full'>
              {files.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContentWithoutPortal side="top" align="end" className="p-1 w-[300px]">
        <Dashboard 
          id="dashboard" 
          uppy={uppy}
          theme="light"
          hideUploadButton
          height={300}
          width="100%"
        />
      </PopoverContentWithoutPortal>
    </Popover>
  )

}

export default Chatbox