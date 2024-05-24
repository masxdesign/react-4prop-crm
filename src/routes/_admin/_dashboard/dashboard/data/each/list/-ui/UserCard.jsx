import { EnvelopeClosedIcon } from "@radix-ui/react-icons"
import { PhoneCallIcon } from "lucide-react"
import Ddd from "./Ddd"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const UserCard = ({ data, onView, hideView, hideContact, className, isSent }) => (
    <div className={cn('text-sm space-y-2', className)}>
      <div className='flex flex-row justify-between gap-4'>
        <div className='space-y-1 max-w-[180px]'>
          <b>{data.first} {data.last} {isSent && <Badge variant="outline">Sent</Badge>}</b>
          <div className='text-nowrap truncate text-muted-foreground'>{data.company}</div>
        </div>
        {!hideView && <Button variant="secondary" size="sm" className="shrink" onClick={() => onView(data)}>open</Button>}
      </div>
      {!hideContact && [
        { label: <EnvelopeClosedIcon className="w-4 h-4" />, name: "email" },
        { label: <PhoneCallIcon className="w-4 h-4" /> , name: "phone" },
      ].map((props) => (
        <Ddd key={props.name} row={data} labelClassName="max-w-[10px]" {...props} />
      ))}
    </div>
)

export default UserCard