import { EnvelopeClosedIcon, MobileIcon } from "@radix-ui/react-icons"
import { PhoneCallIcon } from "lucide-react"
import { Ddd } from "@/components/DisplayData/components"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cx } from "class-variance-authority"

const UserCard = ({ data, onView, hideView, hideContact, clickable, className }) => {
  const handleOpen = () => {
    if (!clickable) return
    onView(data)
  }

  return (
      <div 
        className={cn('text-sm space-y-2', className)} 
        onClick={handleOpen}
      >
        <div className='flex flex-row justify-between gap-4'>
          <div className='space-y-1 max-w-[180px]'>
            <b>{data.first} {data.last}</b>
            <div className='text-nowrap truncate text-muted-foreground'>{data.company}</div>
          </div>
          {!hideView && (
            <Button 
              variant="secondary" 
              size="sm" 
              className={cx("shrink", { "hover:underline": clickable })} 
              onClick={handleOpen}
            >
                open
            </Button>
          )}
        </div>
        {!hideContact && [
          { label: <EnvelopeClosedIcon className="w-4 h-4" />, name: "email" },
          { label: <PhoneCallIcon className="w-4 h-4" /> , name: "phone" },
          { label: <MobileIcon className="w-4 h-4" /> , name: "mobile" },
        ].map((props) => (
          <Ddd 
            key={props.name} 
            row={data} 
            labelClassName="max-w-[10px]" 
            className="w-[280px]"
            {...props} 
          />
        ))}
      </div>
  )
}

export default UserCard