import { Loader2 } from "lucide-react";

export default function PendingComponent () {
    return (
        <div className="flex items-center justify-center h-screen w-100">
            <Loader2 className="animate-spin w-20 h-20" />
        </div>
    )
}