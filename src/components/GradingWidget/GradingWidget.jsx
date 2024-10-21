import React, { useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cx } from "class-variance-authority"

const MotionIcon = ({ icon, color }) => (
    <motion.div 
        style={{ backgroundImage: `url(https://4prop.com/svg/${icon}/10/${color})` }}
        className="bg-no-repeat pt-[100%] cursor-pointer bg-cover"
        whileTap={{ scale: .6 }}
        whileHover={{ scale: 1.2 }}
    />
)

const matrix = [
    [0, 0, 0, 0],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 1],
]

const labels = ["", "Reject", "Least suitable", "Suitable", "Most suitable"]

const STAR = 'star'
const REJECT = 'close'

const GradingWidget = ({
    size = 40,
    defaultGrade = 0,
    className,
    onSelect,
    style,
    ...props
}) => {

    const tm = useRef()
    
    const [value, setValue] = useState(defaultGrade)
    const [hover, setHover] = useState(null)
    const [notify, setNotify] = useState(false)

    const handleSelect = value => {

        if (tm.current) clearTimeout(tm.current)

        setValue(value)
        setHover(null)
        setNotify(true)

        onSelect?.(value)

        tm.current = setTimeout(() => { setNotify(false) }, 600)

    }

    const list = matrix[hover ?? value]

    return (
        <div 
            className={cx("flex flex-col gap-3", className)} 
            style={{ ...style, width: size }} 
            {...props}
        >
            {list.map((active, id) => {
                const newValue = id + 1

                return (
                    <div 
                        key={newValue}
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
            })}
        </div>
    )
}

export default GradingWidget
