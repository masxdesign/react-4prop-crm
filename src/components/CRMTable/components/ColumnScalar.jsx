import { cn } from "@/lib/utils"
import { isNumber, isString } from "lodash"
import { Badge } from "@/components/ui/badge"

function IsString ({ value }) {

  if (!isString(value)) return null

  return (
    value?.length > 0 ? value : <i className='font-normal opacity-50'>(empty)</i>
  )
}

function IsNumber ({ value }) {

  if (!isNumber(value)) return null

  return (
    <Badge variant={value > 0 ? 'default': 'secondary'}>{value}</Badge>
  )
}

const ColumnScalar = ({ value, className, ...props }) => {

    return (
        <div 
            className={cn(
                "cursor-pointer whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline p-4",
                className
            )} 
            {...props}
        >
            <IsString value={value} />
            <IsNumber value={value} />
        </div>
    )
}

export default ColumnScalar