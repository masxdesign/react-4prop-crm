import React from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import GradingWidget from '@/components/GradingWidget'
import { cx } from 'class-variance-authority'
import { useRouteGradeContext } from './_auth.grade'
import useListing from '@/store/use-listing'
import queryClient from '@/queryClient'
import PropertyDetail from '@/components/PropertyDetail'

export const Route = createFileRoute('/_auth/grade/_gradeWidget')({
  component: LayoutGradeWidgetComponent,
  loader: ({ context }) => queryClient.ensureQueryData(context.resolvePropertyDetails),
  beforeLoad ({ params }) {
      return {
          resolvePropertyDetails: useListing.getState().resolvePropertyDetailsQueryOptions(params.pid)
      }
  }
})

function LayoutGradeWidgetComponent () {
    const data = Route.useLoaderData()

    const { grade, onGradeSelect } = useRouteGradeContext()

    return (
        <div className="flex justify-center p-0">
            <div className='inline-flex gap-3'>
                <div>
                    <GradingWidget 
                        size={30} 
                        value={grade}
                        onSelect={onGradeSelect}
                        className="sticky top-3 left-0 z-10"
                    />
                </div>
                <div className='relative grow px-3 max-w-[450px]'>
                    <PropertyDetail data={data} className="text-sm mb-8" />
                    <Outlet />                  
                </div>
            </div>
        </div>
    )
}