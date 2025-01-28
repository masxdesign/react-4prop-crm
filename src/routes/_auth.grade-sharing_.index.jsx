import * as yup from "yup"
import AssignTagInput from '@/features/tags/components/AssignTagInput'
import Selection from '@/components/Selection'
import { useGradeSharingStore } from '@/hooks/useGradeSharing'
import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/Auth/Auth'
import { sharedTagListQueryOptions, tagListQueryOptions } from '@/features/tags/queryOptions'
import { Button } from '@/components/ui/button'
import { decodeFromBinary, encodeToBinary } from '@/utils/binary'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { postMessage } from '@/utils/iframeHelpers'
import useListing from '@/store/use-listing'
import PropertyDetail from '@/components/PropertyDetail'
import GradingWidget from '@/components/GradingWidget'
import { useLocalStorage } from "@uidotdev/usehooks"
import { takeRight } from "lodash"
import { recentGradeSharesQueryOptions } from "@/features/gradeSharing/services"
import { ArrowTopRightIcon } from "@radix-ui/react-icons"

export const Route = createFileRoute('/_auth/grade-sharing/')({
  component: GradeSharingConfirmComponent
})

const schema = yup.object().shape({
    selected: yup.object().shape({
        id: yup.number(),
        email: yup.string().email()
    }).required(),
    tag: yup.object().shape({
        id: yup.number(),
        name: yup.string().required()
    }).required()
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

        window.scrollTo({ top: 0, behavior: 'smooth' })

    }, [])

    const openedPid = useGradeSharingStore.use.openedPid()
    const openedGrade = useGradeSharingStore.use.openedGrade()
    const setOpenedGrade = useGradeSharingStore.use.setOpenedGrade()
    const selected = useGradeSharingStore.use.selected()
    const tag = useGradeSharingStore.use.tag()
    const setTag = useGradeSharingStore.use.setTag()

    const handleCancel = () => {
        postMessage({ type: "HIDE" })
    }

    const validate = useCallback((selected, tag) => {

        try {

            return schema.validateSync({
                selected,
                tag
            })
            
        } catch (e) {

            return null
        
        }

    }, [])

    const validated = useMemo(() => validate(selected, tag), [selected, tag])

    const applyClientTag = useCallback(({ selected, tag }) => {

        const data = [selected.id, selected.email, tag.id, tag.name, openedPid, openedGrade]
        const bin = encodeToBinary(JSON.stringify(data))

        postMessage({ type: "GRADESHARING_CLIENT_TAG", payload: bin })
        postMessage({ type: "HIDE" })

    }, [openedPid, openedGrade])

    const handleApply = () => {
        applyClientTag({ selected, tag })
    }
    
    return (
        <div className='flex flex-col justify-between h-screen'>
            <div className='py-3 space-y-4'> 
                {openedPid && (
                    <div className="px-3 space-y-2">
                        <h3 className="text-sm font-bold">
                            Grade your first property
                        </h3>
                        <Suspense fallback={<Loader2 className='animate-spin' />}>
                            <PropertyGrade 
                                pid={openedPid} 
                                grade={openedGrade} 
                                onGrade={setOpenedGrade} 
                            />
                        </Suspense>
                    </div>
                )}        

                <div className="sticky top-0 bg-white space-y-4 px-3 py-3 shadow-sm">                
                    <div className='space-y-2'>
                        <h3 className="text-sm font-bold">
                            Select client to receive graded Properties
                        </h3>
                        <Link to="select-client" search={{ pid: openedPid }} className='block'>
                            {selected ? (
                                <Selection variant="active">
                                    {selected.email}
                                </Selection>
                            ) : (
                                <Selection variant="plus">
                                    Client email address (required)
                                </Selection>
                            )}
                        </Link>
                    </div>
                    {selected && (
                        <div className='space-y-2'>
                            <h3 className="text-sm font-bold">
                                Enter a search ref/name for you & your Client
                            </h3>
                            <Suspense fallback={<Loader2 className="animate-spin" />}>
                                <AssignTagControl 
                                    from_id={auth.user.id} 
                                    importId={selected.id}
                                    selected={tag}
                                    onSelect={setTag}
                                />
                            </Suspense>
                        </div>     
                    )}
                </div>       

                <div className='px-3 space-y-2'>
                    <h3 className="text-sm font-bold">Recent</h3>
                    <Suspense fallback={<Loader2 className="animate-spin" />}>
                        <RecentGradeShares from_uid={auth.user.id} onSelect={applyClientTag} />
                    </Suspense>
                </div> 

            </div>
            <div className='flex gap-3 justify-center bg-white sticky inset-x-0  bottom-0 p-3 border-t'>
                <div className='space-x-3 text-center'>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply} disabled={!validated}>
                        Start grading
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

function AssignTagControl ({ from_id, importId, selected, onSelect }) {
    const tagsQuery = useSuspenseQuery(sharedTagListQueryOptions(from_id, importId))

    return (
        <AssignTagInput 
            list={tagsQuery.data} 
            selected={selected} 
            onSelect={onSelect} 
            placeholder="eg. Stratford Shop (required)"
        />
    )
}

function RecentGradeShares ({ from_uid, onSelect }) {
    const query = useSuspenseQuery(recentGradeSharesQueryOptions(from_uid))

    const setSelected = useGradeSharingStore.use.setSelected()
    const setTag = useGradeSharingStore.use.setTag()

    if (query.data.length < 1) {
        return <span className="text-slate-500">No grade shares yet</span>
    }

    return (
        <div className="space-y-2">
            {query.data.map(item => {

                const handleSelect = () => {
                    const selected = { id: item.import_id, email: item.email }
                    const tag = { name: item.tagName, id: item.tag_id }

                    setSelected(selected)
                    if (item.tag_id) setTag(tag)

                    onSelect({ selected, tag })
                }

                return (
                    <div 
                        key={`${item.import_id}.${item.tag_id}`}
                        onClick={handleSelect}
                        className="flex justify-between gap-5 rounded-lg p-3 text-sm bg-slate-100 hover:bg-slate-200 cursor-pointer"
                    >
                        <div className="space-y-1">
                            <div>
                                {item.email}
                            </div>
                            <div className="text-slate-500">
                                {item.tagName}
                            </div>
                        </div>
                        <ArrowTopRightIcon />
                    </div>
                )
            })}
        </div>        
    )
}