import { useEffect } from 'react';
import { ExpandIcon, PaperclipIcon, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useChatbox, { filesSelector } from '@/hooks/use-Chatbox';
import { Dashboard, useUppyState } from '@uppy/react';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { useIsFirstRender, usePrevious } from '@uidotdev/usehooks';
import { PopoverContentWithoutPortal } from '@/components/ui-custom/popover';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

function BizchatAttachmentsButton ({ uppy, ...props }) {
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
  
    }, [files.length])
  
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="xs" className="relative" {...props}>
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
          />
        </PopoverContentWithoutPortal>
      </Popover>
    )
  
}

export default BizchatAttachmentsButton