import React, { useContext, useState } from 'react'
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useLayoutGradeContext } from '../_auth.grade'
import { Route as AuthGradePidShareConfirmImport } from '@/routes/_auth.grade/$pid_.share/_first_screen/confirm'
import { Route as AuthGradeShareSuccessRouteImport } from '@/routes/_auth.grade_.share_.success/route'
import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { crmAddTag, crmShareGrade, crmTagList } from '@/services/bizchat'
import { useAuth } from '@/components/Auth/Auth-context'

export const Route = createFileRoute('/_auth/grade/$pid/share')({
  component: GradeShareComponent
})

const GradeShareContext = React.createContext(null)

export const useGradeShareContext = () => useContext(GradeShareContext)

function GradeShareComponent () {
    const auth = useAuth()
    const queryClient = useQueryClient()

    const { pid } = Route.useParams() 
    const { grade } = useLayoutGradeContext()

    const addTag = useMutation({
        mutationFn: name => crmAddTag(auth.authUserId, name)
    })

    const shareGrade = useMutation({
        mutationFn: ({ recipient_import_id, pid, grade, tag_id }) => crmShareGrade(
            auth.authUserId, 
            recipient_import_id, 
            pid, 
            grade, 
            tag_id
        )
    })

    const tagListQueryOptions = queryOptions({
        queryKey: ['tagList', auth.authUserId],
        queryFn: () => crmTagList(auth.authUserId)
    })

    const navigate = useNavigate()

    const [selected, setSelected] = useState(null)
    const [tag, setTag] = useState(null)

    const handleConfirm = (newSelected) => {
        setSelected(newSelected)
        navigate({ to: AuthGradePidShareConfirmImport.to })
    }

    const handleShare = async () => {

        let tag_id = tag.id

        if (tag_id < 0) {
            const newTag = await addTag.mutateAsync(tag.name)
            tag_id = newTag.id

            queryClient.invalidateQueries({ queryKey: tagListQueryOptions.queryKey })
        }

        const result = await shareGrade.mutateAsync({
            recipient_import_id: selected.id, 
            pid, 
            grade, 
            tag_id 
        })

        console.log(result);
        

        navigate({ to: AuthGradeShareSuccessRouteImport.to })
    }

    const context = { 
        selected, 
        tag,
        onTagChange: setTag,
        onSelect: setSelected, 
        onConfirm: handleConfirm,
        onShare: handleShare,
        tagListQueryOptions
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