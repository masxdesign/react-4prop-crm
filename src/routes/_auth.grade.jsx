import React, { useContext, useState } from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import GradingWidget from '@/components/GradingWidget'
import useListing from '@/store/use-listing'
import { cx } from 'class-variance-authority'
import queryClient from '@/queryClient'


export const Route = createFileRoute('/_auth/grade')({
    loader: ({ context }) => queryClient.ensureQueryData(context.resolvePropertyDetails),
    component: LayoutGradeComponent,
    beforeLoad ({ params }) {
        return {
            resolvePropertyDetails: useListing.getState().resolvePropertyDetailsQueryOptions(params.pid)
        }
    }
})

const LayoutGradeContext = React.createContext(null)
export const useLayoutGradeContext = () => useContext(LayoutGradeContext)

function LayoutGradeComponent () {

    const data = Route.useLoaderData()

    const { defaultGrade = 2 } = Route.useSearch()

    const [value, setValue] = useState(defaultGrade)

    const handleGradeSelect = (newValue) => {
        setValue(newValue)
    }

    return (
        <div className="flex justify-center p-0">
            <div className='inline-flex gap-3'>
                <div>
                    <GradingWidget 
                        size={30} 
                        value={value}
                        onSelect={handleGradeSelect}
                        className="sticky top-3 left-0 z-10"
                    />
                </div>
                <div className='relative grow px-3 max-w-[400px]'>
                    <PropertyDetail data={data} className="mb-8" />
                    <LayoutGradeContext.Provider value={{ grade: value }}>
                        <Outlet />
                    </LayoutGradeContext.Provider>                    
                </div>
            </div>
        </div>
    )
}

function PropertyDetail ({ data, className }) {
    const { title, statusColor, statusText, sizeText, tenureText, thumbnail, content } = data
    return (
        <div className={cx("space-y-3 max-w-[400px]", className)}>
            <div className='flex gap-3'>
                <img src={thumbnail} className="object-contain w-20 h-20 bg-gray-200" />
                <div className="space-y-1 sm:space-y-1 text-sm grow">
                    <span className='font-bold'>
                        {title}
                    </span>
                    <div className='flex flex-row gap-3'>
                        <div className={cx("text-xs font-bold", { 
                            "text-green-600": statusColor === "green",
                            "text-amber-600": statusColor === "amber",
                            "text-sky-600": statusColor === "sky",
                            "text-red-600": statusColor === "red",
                        })}>{statusText}</div>
                        <div className='text-xs text-muted-foreground'>{sizeText}</div>
                        <div className='text-xs text-muted-foreground'>{tenureText}</div>
                    </div>
                    <div className="text-xs opacity-40 truncate max-w-52">{content.teaser}</div>
                </div>
            </div>                
        </div>
    )
}