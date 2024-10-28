import { Button } from '@/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShareIcon, User2 } from 'lucide-react'
import { Route as RouteGradeShare } from "./$pid_.share/index/route"
import { cx } from 'class-variance-authority'
import { postMessage } from '@/utils/iframeHelpers'
import { useRouteGradeContext } from '@/routes/_auth.grade'

export const Route = createFileRoute('/_auth/grade/_gradeWidget/$pid')({
  component: GradeQuestionsComponent
})

function GradeQuestionsComponent () {

    const navigate = useNavigate()

    const { grade } = useRouteGradeContext()

    const { pid } = Route.useParams()

    const handleShare = () => {

        navigate({ to: RouteGradeShare.to, params: { pid } })

    }

    const disableSaveButton = [0].includes(grade) || !grade
    const disableShareButton = [0, 1].includes(grade)

    return (
        <div className='flex flex-col gap-3 max-w-[400px]'>
            <SaveForMeButton 
                className={cx({ 'opacity-50': disableSaveButton })}
                disabled={disableSaveButton}
            />
            <Button 
                variant="outline"  
                onClick={handleShare}
                disabled={disableShareButton}                
                className={cx('space-x-3', { 'opacity-50': disableShareButton })}                    
            >
                <ShareIcon className='w-4 h-4' />
                <span>Share with CRM contact</span>
                <span className='inline-block px-2 py-1 font-bold bg-yellow-300 text-orange-800 rounded-sm text-xs'>crm</span>
            </Button>
        </div>
    )
}


export function SaveForMeButton ({ className, ...props }) {
    const { grade } = useRouteGradeContext()

    const { pid } = Route.useParams()

    const handleSaveForMe = () => {
        postMessage({ type: "SAVE_FOR_ME", payload: grade, meta: { pid } })
    }

    return (
        <Button 
            variant="outline"      
            onClick={handleSaveForMe}           
            className={cx('space-x-3', className)}
            {...props}
        >
            <User2 className='w-4 h-4' />
            <span>Save for me</span>
            <span className='inline-block px-2 py-1 font-bold bg-sky-100 text-blue-800 rounded-sm text-xs'>4Prop</span>
        </Button>
    )
}