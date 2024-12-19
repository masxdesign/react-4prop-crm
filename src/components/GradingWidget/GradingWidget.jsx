import React, { useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "class-variance-authority"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Slot } from "@radix-ui/react-slot"

const STAR = 'star'
const REJECT = 'close'

const MotionIcon = React.forwardRef(({ icon, color }, ref) => (
    <motion.div 
        ref={ref}
        style={{ backgroundImage: `url(https://4prop.com/svg/${icon}/10/${color})` }}
        className="bg-no-repeat pt-[100%] cursor-pointer bg-cover"
        whileTap={{ scale: .6 }}
        whileHover={{ scale: 1.2 }}
    />
))

const matrix = [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 1],
]

const labels = ["", "Reject", "Least suitable", "Suitable", "Most suitable"]

const GradingWidget = ({
    size = 40,
    value,
    onSelect,
    className,
    style,
    tooltipTextReject = "Move to inactive",
    ...props
}) => {

    const tm = useRef()
    
    const [hover, setHover] = useState(null)
    const [notify, setNotify] = useState(false)

    const handleSelect = value => {

        if (tm.current) clearTimeout(tm.current)

        onSelect?.(value)
        setHover(null)
        setNotify(true)

        tm.current = setTimeout(() => { setNotify(false) }, 600)

    }

    const list = matrix[hover ?? value]

    return (
        <div 
            className={cx("flex flex-col-reverse gap-3", className)} 
            style={{ ...style, width: size }} 
            {...props}
        >
            {list.map((active, id) => {
                const newValue = id + 1

                const component = (
                    <div 
                        className="relative"
                        onClick={() => handleSelect(newValue)}
                        onMouseEnter={() => setHover(newValue)}
                        onMouseLeave={() => setHover(null)}                            
                    >
                        <AnimatePresence>
                            {value === newValue && notify && (
                                <motion.div
                                    className={cx(
                                        "absolute p-2 rounded-sm text-sm text-nowrap", 
                                        value === 1 ? "bg-red-100 text-red-800": "bg-orange-100 text-orange-800"
                                    )}
                                    initial={{ opacity: 0, x: 0, y: 0, scale: .5 }}
                                    animate={{ opacity: 1, x: size * 1.2, scale: 1 }}
                                    exit={{ opacity: 0, x: 10, scale: .4 }}
                                >
                                    {labels[value]}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {id === 0 ? (
                            <MotionIcon 
                                icon={REJECT} 
                                color={active ? 'f00': 'ccc'}
                            />
                        ) : (
                            <MotionIcon 
                                icon={STAR}  
                                color={active ? 'ff9a00': 'ccc'}
                            />
                        )}
                    </div>
                )

                if (id === 0) {
                    return (
                        <Tooltip delayDuration={100} key={newValue}>
                            <TooltipTrigger asChild>
                                {component}
                            </TooltipTrigger>
                            <TooltipContent>
                                {tooltipTextReject}
                            </TooltipContent>
                        </Tooltip>
                    )
                }

                return (
                    <Slot key={newValue}>
                        {component}
                    </Slot>
                )

            })}
        </div>
    )
}

export default GradingWidget
