import { useEffect, useRef } from "react"
import routeSearchMapping from "@/utils/routeSearchMapping"
import { useMatch, useNavigate } from "@tanstack/react-router"
import { useIsFirstRender } from "@uidotdev/usehooks"

export default function useRouteSearchStateUpdater ({ 
    defaultState = {},
    state,
    routeStateMapFn,
    onRouteSearchChange
}) {
    const isFirstRender = useIsFirstRender()
    const reasonRef = useRef("AMBIGIOUS")
    const skipStateChangeRef = useRef(false)

    const navigate = useNavigate({ strict: false })
    const match = useMatch({ strict: false })

    useEffect(() => {

        if (!isFirstRender && !skipStateChangeRef.current) {

            reasonRef.current = "STATE_CHANGE"

            navigate({
                search: (prev) => {
                    return routeSearchMapping(defaultState, state, prev, routeStateMapFn)
                }
            })

        }

        skipStateChangeRef.current = false

    }, [state])

    useEffect(() => {

        if (!isFirstRender && reasonRef.current === "AMBIGIOUS") {

            onRouteSearchChange(match.search)
            skipStateChangeRef.current = true

        }
        
        reasonRef.current = "AMBIGIOUS"

    }, [match.updatedAt])
}