import React, { useContext, useState } from 'react'
import { createFileRoute, Link, MatchRoute, Outlet, redirect, rootRouteId, useMatch, useMatches, useMatchRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { useRouteGradeContext } from '@/routes//_auth.grade'
import { Route as AuthGradePidShareConfirmImport } from '@/routes//_auth.grade._gradeWidget/$pid_.share/confirm'
import { Route as AuthGradeShareSuccessRouteImport } from '@/routes//_auth.grade_.share_.success/route'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { crmAddTag, crmFilterByEmail, crmShareGrade, crmTagList } from '@/services/bizchat'
import { Route as AuthGradePromoImport } from '@/routes//_auth.grade._gradeWidget/$pid_.crm-promo'
import { useAuth } from '@/components/Auth/Auth-context'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTagListQueryOptions } from '../_auth._dashboard/tags'
import { Button } from '@/components/ui/button'

const allowUsersList = ['U161', 'U2']

export const Route = createFileRoute('/_auth/grade/_gradeWidget/$pid/share')({
  component: GradeShareComponent,
  beforeLoad: ({ context, params }) => {
    

    if (!allowUsersList.includes(context.auth.authUserId)) {

        throw redirect({ 
            to: AuthGradePromoImport.to, 
            params: { pid: params.pid } 
        })

    }

  }
})

const GradeShareContext = React.createContext(null)

export const useGradeShareContext = () => useContext(GradeShareContext)

function GradeShareComponent () {
    const auth = useAuth()
    const queryClient = useQueryClient()

    const { pid } = Route.useParams() 
    const { grade } = useRouteGradeContext()

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

    const tagListQueryOptions = useTagListQueryOptions(auth.authUserId)

    const navigate = useNavigate()

    const [selected, setSelected] = useState(null)
    const [tag, setTag] = useState(null)

    const handleConfirm = newSelected => {
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

        console.log(result)

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
            <div className='flex flex-col gap-3 max-w-[450px] relative'>
                <GradeShareContext.Provider value={context}>
                    <Outlet />
                </GradeShareContext.Provider>
            </div>
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

const initialFiltered = []

export function useGradeShareFilterByEmailQuery (email, enabled = true) {
    const auth = useAuth()
    const { pid } = Route.useParams() 

    const query = useQuery({
        queryKey: ['filterByEmail', auth.authUserId, email],
        queryFn: () => crmFilterByEmail(auth.authUserId, email, pid),
        enabled: enabled && !!email,
        initialData: initialFiltered
    })

    return query
}