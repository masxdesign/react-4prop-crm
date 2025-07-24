import { cn } from "@/lib/utils"
import { useEffect, useLayoutEffect, useRef } from "react"

export default function TabsClipPath({ tabs, activeTab, onSelect, className }) {
    const containerRef = useRef(null)
    const activeTabElementRef = useRef(null)

    useLayoutEffect(() => {
        const container = containerRef.current

        if (activeTab && container) {
            const activeTabElement = activeTabElementRef.current

            if (activeTabElement) {
                const { offsetLeft, offsetWidth } = activeTabElement

                const clipLeft = offsetLeft
                const clipRight = offsetLeft + offsetWidth
                
                container.style.clipPath = `inset(0 ${Number(100 - (clipRight / container.offsetWidth) * 100).toFixed()}% 0 ${Number((clipLeft / container.offsetWidth) * 100).toFixed()}% round 17px)`
            }
        }
    }, [activeTab])

    return (
        <div className={cn("relative flex flex-col items-center w-fit", className)}>
            <ul className="relative flex justify-center gap-3">
                {tabs.map((tab) => (
                    <li key={tab.id}>
                        <button
                            ref={
                                activeTab === tab
                                    ? activeTabElementRef
                                    : null
                            }
                            onClick={() => onSelect(tab)}
                            className="text-slate-300 flex h-[34px] items-center gap-2 rounded-full px-4 text-sm font-medium no-underline"
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    </li>
                ))}
            </ul>
            <div
                ref={containerRef}
                className="absolute z-10 w-full transition-[clip-path] duration-200 ease-in overflow-hidden"
                aria-hidden
            >
                <ul className="relative flex justify-center gap-3 bg-sky-500">
                    {tabs.map((tab) => (
                        <li key={tab.id}>
                            <button
                                className="text-white flex h-[34px] items-center gap-2 rounded-full px-4 text-sm font-medium no-underline"
                            >
                                {tab.icon}
                                {tab.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
