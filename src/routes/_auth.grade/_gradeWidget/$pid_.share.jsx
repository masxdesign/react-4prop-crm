import React, { useContext, useState } from 'react'
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import { useRouteGradeContext } from '@/routes/_auth.grade'
import { Route as AuthGradePidShareConfirmImport } from '@/routes/_auth.grade/_gradeWidget/$pid_.share/confirm'
import { Route as AuthGradeShareSuccessRouteImport } from '@/routes/_auth.grade_.share_.success/route'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { crmAddTag, crmFilterByEmail, crmShareGrade, crmTagList } from '@/services/bizchat'
import { Route as AuthGradePromoImport } from '@/routes/_auth.grade/_gradeWidget/$pid_.crm-promo'
import { useAuth } from '@/components/Auth/Auth-context'
import { ArrowLeft, ArrowRight } from 'lucide-react'

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

    const { location } = useRouterState()

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

    const tagListQueryOptions = queryOptions({
        queryKey: ['tagList', auth.authUserId],
        queryFn: () => crmTagList(auth.authUserId)
    })

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
            <div className='flex flex-col gap-3 max-w-[400px] relative'>
                <div className='flex gap-2 items-center'>
                    <Link to=".." from={location.pathname}>
                        <ArrowLeft className='w-5 h-5 cursor-pointer' />
                    </Link>
                    {selected && (
                        <Link to="confirm" className='[&.active]:hidden'>
                            <ArrowRight className='w-5 h-5 cursor-pointer' />
                        </Link>
                    )}
                    <div className='border-r border-2 h-6' />
                    <h2 className='font-bold text-md space-x-3'>
                        <span>Share with CRM contact</span>
                        <span className='inline-block px-2 py-1 font-bold bg-yellow-300 text-orange-800 rounded-sm text-xs'>crm</span>
                    </h2>
                </div>
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

    const query = useQuery(queryOptions({
        queryKey: ['filterByEmail', auth.authUserId, email],
        queryFn: () => crmFilterByEmail(auth.authUserId, email, pid),
        enabled: enabled && !!email,
        initialData: initialFiltered
    }))

    return query
}