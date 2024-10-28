import React, { useContext, useState } from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/grade')({
    component: LayoutGradeComponent
})

const RouteGradeContext = React.createContext(null)

export const useRouteGradeContext = () => useContext(RouteGradeContext)

function LayoutGradeComponent () {

    const { defaultGrade = 2 } = Route.useSearch()

    const [value, setValue] = useState(defaultGrade)

    const handleGradeSelect = (newValue) => {
        setValue(newValue)
    }

    const context = { 
        grade: value, 
        onGradeSelect: handleGradeSelect 
    }

    return (
        <RouteGradeContext.Provider value={context}>
            <Outlet />
        </RouteGradeContext.Provider>                    
    )
}