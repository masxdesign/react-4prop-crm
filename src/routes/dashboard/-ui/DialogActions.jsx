import { CaretSortIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CategoriesPrimitive from './CategoriesPrimitive';
import LogChatboxContainer from './LogChatboxContainer';
import { Mail, MapPin, Phone } from 'lucide-react';

const infoList = [
    { field: 'email', icon: <Mail className="h-3 w-3" /> },
    { field: 'phone', icon: <Phone className="h-3 w-3" /> },
    { field: 'address', render: (info) => `${info.row.getValue('city')} ${info.row.getValue('postcode')}`, icon: <MapPin className="h-3 w-3" /> }
]

const DialogActions = ({ info }) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <ChatBubbleIcon className='cursor-pointer' />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
          <Collapsible> 
            <DialogTitle>
              {info.row.getValue('fullName')}
            </DialogTitle>
            <DialogDescription>
              <CollapsibleTrigger className='flex space-x-2 items-center'> 
                {/* <CategoriesPrimitive info={info} /> */}
                <span>{info.row.getValue('company')}</span>
                <CaretSortIcon className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent asChild className='flex flex-wrap'>
                <span>
                  {infoList.map(({ field, render, icon }) => (
                    <span key={field} className='flex space-x-1 mr-4 items-center'>
                      {icon}
                      <span className='text-nowrap'>
                        {render ? render(info) : info.row.getValue(field)}
                      </span>
                    </span>
                  ))}
                </span>
              </CollapsibleContent>
            </DialogDescription>
            </Collapsible>
          </DialogHeader>
          <LogChatboxContainer info={info} />        
        </DialogContent>
      </Dialog>
    )
}

export default DialogActions