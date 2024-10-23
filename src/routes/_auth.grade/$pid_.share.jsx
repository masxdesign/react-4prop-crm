import React, { useContext, useState } from 'react'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useLayoutGradeContext } from '../_auth.grade'
import { Route as AuthGradePidShareConfirmImport } from '@/routes/_auth.grade/$pid_.share/_first_screen/confirm'
import { Route as AuthGradeShareSuccessRouteImport } from '@/routes/_auth.grade_.share_.success/route'

export const Route = createFileRoute('/_auth/grade/$pid/share')({
  component: GradeShareComponent
})

const GradeShareContext = React.createContext(null)

export const useGradeShareContext = () => useContext(GradeShareContext)

function GradeShareComponent () {
    const { pid } = Route.useParams() 
    const { grade } = useLayoutGradeContext()

    const navigate = useNavigate()

    const [selected, setSelected] = useState(null)
    const [tag, setTag] = useState(null)

    const handleConfirm = (newSelected) => {
        setSelected(newSelected)
        navigate({ to: AuthGradePidShareConfirmImport.to })
    }

    const handleShare = () => {
        console.log(pid, grade, selected, tag)
        navigate({ to: AuthGradeShareSuccessRouteImport.to })
    }

    const context = { 
        selected, 
        tag,
        onTagChange: setTag,
        onSelect: setSelected, 
        onConfirm: handleConfirm,
        onShare: handleShare
    }
    
    return (
        <>
            <GradeShareContext.Provider value={context}>
                <Outlet />
            </GradeShareContext.Provider>
            {[0, 1].includes(grade) && (
                <>
                    <div className='absolute inset-0 bg-white opacity-80' />
                    <div className='absolute inset-0 pt-8 px-3'>
                        <div className='bg-white border px-4 py-3 shadow-lg rounded-md text-sm text-left inline-block'>
                            {grade === 0 ? 
                                "Please select your grade"
                            : 
                                "Reject can't be shared"
                            }
                        </div>
                    </div>
                </>
            )}
        </>
    )
}