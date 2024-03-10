import { cn } from "@/lib/utils"

const ProgressCircle = ({ perc, className }) => {
    return (
        <div className={cn("relative w-10 h-10", className)}>
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-gray-200 stroke-current"
                    strokeWidth="10"                    
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                />
                <circle
                    className="text-green-600  progress-ring__circle stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDashoffset={`calc(400 - (400 * 64 * ${+perc / 100}) / 100)`}
                />
                <text x="50" y="50" fontFamily="Verdana" fontSize="18" textAnchor="middle" alignmentBaseline="middle">
                    {`${perc}%`}
                </text>
            </svg>
        </div>
    )
}

export default ProgressCircle