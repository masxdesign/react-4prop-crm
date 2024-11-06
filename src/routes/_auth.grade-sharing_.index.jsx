import AssignTagInput from '@/features/tags/components/AssignTagInput'
import Selection from '@/components/Selection'
import { useGradeSharingStore } from '@/hooks/useGradeSharing'
import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/Auth/Auth-context'
import { tagListQueryOptions } from '@/features/tags/queryOptions'
import { Button } from '@/components/ui/button'
import { decodeFromBinary, encodeToBinary } from '@/utils/binary'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { postMessage } from '@/utils/iframeHelpers'
import useListing from '@/store/use-listing'
import PropertyDetail from '@/components/PropertyDetail'
import GradingWidget from '@/components/GradingWidget'

export const Route = createFileRoute('/_auth/grade-sharing/')({
  component: GradeSharingConfirmComponent
})

function GradeSharingConfirmComponent () {

    const auth = useAuth()

    const { pid, defaultGrade = null } = Route.useSearch()
    
    const { value } = Route.useSearch()

    const setFromBin = useGradeSharingStore.use.setFromBin()
    const setOpenedProperty = useGradeSharingStore.use.setOpenedProperty()

    useEffect(() => {

        if (!!value) {
            setFromBin(value)
        }

        if (pid) {
            setOpenedProperty(defaultGrade, pid)
        }

    }, [])

    const openedPid = useGradeSharingStore.use.openedPid()
    const openedGrade = useGradeSharingStore.use.openedGrade()
    const setOpenedGrade = useGradeSharingStore.use.setOpenedGrade()
    const selected = useGradeSharingStore.use.selected()
    const tag = useGradeSharingStore.use.tag()
    const setTag = useGradeSharingStore.use.setTag()

    const tagsQuery = useQuery(tagListQueryOptions(auth.authUserId))

    const handleApply = () => {

        const data = [selected.id, selected.email, tag.id, tag.name, openedPid, openedGrade]
        const bin = encodeToBinary(JSON.stringify(data))

        postMessage({ type: "GRADESHARING_CLIENT_TAG", payload: bin })
        postMessage({ type: "HIDE" })
        
    }

    return (
        <div className='flex flex-col justify-between h-screen'>
            <div className='p-3 space-y-4'>
                {openedPid && (
                    <Suspense fallback={<Loader2 className='animate-spin' />}>
                        <PropertyGrade pid={openedPid} grade={openedGrade} onGrade={setOpenedGrade} />
                    </Suspense>
                )}
                <div className='space-y-2'>
                    <h3 className="text-sm font-bold">
                        select client to receive graded Properties
                    </h3>
                    <Link to="select-client" className='block'>
                        {selected ? (
                            <Selection variant="active">
                                {selected.email}
                            </Selection>
                        ) : (
                            <Selection variant="plus">
                                Select client...
                            </Selection>
                        )}
                    </Link>
                </div>
                <div className='space-y-2'>
                    <h3 className="text-sm font-bold">
                        enter a search ref/name for you & your Client
                    </h3>
                    {tagsQuery.isFetching ? (
                        <Loader2 className='animate-spin' />
                    ) : (
                        <AssignTagInput 
                            list={tagsQuery.data} 
                            value={tag} 
                            onChange={setTag} 
                            placeholder="eg. Stratford Shop"
                        />
                    )}
                </div>
            </div>
            <div className='flex gap-3 justify-center sticky inset-x-0  bottom-0 p-3 border-t'>
                <div className='space-y-3 text-center'>
                    <Button onClick={handleApply}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}

function PropertyGrade ({ pid, grade, onGrade }) {
    const dataQueryOptions = useListing.use.resolvePropertyDetailsQueryOptions()

    const dataQuery = useSuspenseQuery(dataQueryOptions(pid))

    return (
        <div className='flex items-start gap-8 max-w-[400px]'>
            <div>
                <GradingWidget 
                    size={25} 
                    value={grade}
                    onSelect={onGrade}
                    className="sticky top-3 left-0 z-10"
                />
            </div>
            <PropertyDetail data={dataQuery.data} className="text-sm mb-8" />
        </div>
    )
}