import { cn } from "@/lib/utils"
import { Link as LinkTS } from "@tanstack/react-router"

const Link = props => <LinkTS className={cn("[&.active]:font-bold", props.className)} {...props} />

export default Link