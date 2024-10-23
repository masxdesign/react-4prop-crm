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

    const { defaultGrade = 0 } = Route.useSearch()

    const [value, setValue] = useState(defaultGrade)

    const handleGradeSelect = (newValue) => {
        setValue(newValue)
    }

    return (
        <div className="p-3">
            <div className='flex gap-3'>
                <div>
                    <GradingWidget 
                        size={30} 
                        value={value}
                        onSelect={handleGradeSelect}
                        className="sticky top-3 left-0 z-10"
                    />
                </div>
                <div className='relative grow px-3 max-w-[400px]'>
                    <PropertyDetail data={data} className="mb-3" />
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
        <div className={cx("space-y-3 hover:bg-sky-50 max-w-[400px]", className)}>
            <div className='flex gap-3'>
                <img src={thumbnail} className="object-contain w-10 h-10 sm:w-20 sm:h-20 bg-gray-200" />
                <div className="space-y-3 sm:space-y-1 text-sm grow">
                    <span className='font-bold hover:underline'>
                        {title}
                    </span>
                    <div className='flex flex-col sm:flex-row gap-0 sm:gap-3'>
                        <div className={cx("font-bold", { 
                            "text-green-600": statusColor === "green",
                            "text-amber-600": statusColor === "amber",
                            "text-sky-600": statusColor === "sky",
                            "text-red-600": statusColor === "red",
                        })}>{statusText}</div>
                        <div>{sizeText}</div>
                        <div>{tenureText}</div>
                    </div>
                    <div className="opacity-60 truncate max-w-52">{content.teaser}</div>
                </div>
            </div>                
        </div>
    )
}