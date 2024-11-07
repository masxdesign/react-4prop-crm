import * as yup from "yup"
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
import { useLocalStorage } from "@uidotdev/usehooks"
import { takeRight } from "lodash"

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

    const [recent, setRecent] = useLocalStorage("grade-sharing:recent", [])

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
    const setSelected = useGradeSharingStore.use.setSelected()
    const tag = useGradeSharingStore.use.tag()
    const setTag = useGradeSharingStore.use.setTag()

    const tagsQuery = useQuery(tagListQueryOptions(auth.authUserId))

    const handleCancel = () => {
        postMessage({ type: "HIDE" })
    }

    const validated = useMemo(() => {

        try {

            return schema.validateSync({
                selected,
                tag
            })
            
        } catch (e) {

            return null
        
        }

    }, [selected, tag])

    const handleApply = () => {

        if (!validated) return 

        const data = [validated.selected.id, validated.selected.email, validated.tag.id, validated.tag.name, openedPid, openedGrade]
        const bin = encodeToBinary(JSON.stringify(data))

        postMessage({ type: "GRADESHARING_CLIENT_TAG", payload: bin })
        postMessage({ type: "HIDE" })

        setRecent(prevState => {

            const { id, email } = validated.selected
            const _id = `${id}.${validated.tag.id}`

            if (prevState.some(item => item._id === _id)) {
                return prevState
            }

            return [
                { _id, id, email, tag: validated.tag },
                ...takeRight(prevState, 9)
            ]

        })
        
    }
    
    return (
        <div className='flex flex-col justify-between h-screen'>
            <div className='p-3 space-y-4'> 
                {openedPid && (
                    <>
                        <h3 className="text-sm font-bold">
                            Grade your first property
                        </h3>
                        <Suspense fallback={<Loader2 className='animate-spin' />}>
                            <PropertyGrade pid={openedPid} grade={openedGrade} onGrade={setOpenedGrade} />
                        </Suspense>
                        <div className="h-3"></div>
                    </>
                )}               
                <div className='space-y-2'>
                    <h3 className="text-sm font-bold">
                        Select client to receive graded Properties
                    </h3>
                    <Link to="select-client" className='block'>
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
                <div className='space-y-2'>
                    <h3 className="text-sm font-bold">
                        Enter a search ref/name for you & your Client
                    </h3>
                    {tagsQuery.isFetching ? (
                        <Loader2 className='animate-spin' />
                    ) : (
                        <AssignTagInput 
                            list={tagsQuery.data} 
                            value={tag} 
                            onChange={setTag} 
                            placeholder="eg. Stratford Shop (required)"
                        />
                    )}
                </div>     

                <div className="h-8"></div>
                <div className='space-y-2'>
                    <h3 className="text-sm font-bold">Recent</h3>
                    <div className="space-y-2">
                        {recent.map(item => {

                            const handleSelect = () => {
                                setSelected(item)
                                if (item.tag) setTag(item.tag)
                            }

                            return (
                                <div 
                                    key={item._id}
                                    onClick={handleSelect}
                                    className="rounded-lg p-3 text-sm space-y-1 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                                >
                                    <div className="">
                                        {item.email}
                                    </div>
                                    <div className="text-slate-500">
                                        {item.tag?.name}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
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