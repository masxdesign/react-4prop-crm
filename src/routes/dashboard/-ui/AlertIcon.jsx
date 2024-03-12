import { cn } from "@/lib/utils"

const AlertIcon = ({ isProp }) => (
    <div 
        className={cn(
            "bg-[url('https://www.4prop.com/JSON/EACH/files/now/each.co.uk/img/k.png')]",
            "bg-no-repeat w-[20px] h-[20px] cursor-pointer scale-90",
            isProp ? "[background-position-x:-244px]": "[background-position-x:-271px]"
        )}
    />
)

export default AlertIcon