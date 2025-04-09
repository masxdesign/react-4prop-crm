import { createBreakpoint } from "react-use"
import screens from "../../tailwind.screens"

const tailwindcss_screens =  Object.fromEntries(
    Object.entries(screens).map(([breakpoint, screenSize]) => {
        return [breakpoint, parseInt(screenSize)]
    })
)

const useBreakpoint = createBreakpoint(tailwindcss_screens)

export default useBreakpoint