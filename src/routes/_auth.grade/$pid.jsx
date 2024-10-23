import { Button } from '@/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShareIcon, User2 } from 'lucide-react'
import { useLayoutGradeContext } from '.'
import { Route as RouteGradeShare } from "./$pid_.share/_first_screen/index/route"
import { cx } from 'class-variance-authority'

export const Route = createFileRoute('/_auth/grade/$pid')({
  component: GradeQuestionsComponent
})

function GradeQuestionsComponent () {

    const navigate = useNavigate()

    const { grade } = useLayoutGradeContext()

    const { pid } = Route.useParams()

    const handleSaveForMe = () => {

    }

    const handleShare = () => {
        navigate({ to: RouteGradeShare.to, params: { pid } })
    }

    const disableSaveButton = [0].includes(grade) || !grade
    const disableShareButton = [0, 1].includes(grade)

    return (
        <div className='flex flex-col gap-3 max-w-[400px]'>
            <Button 
                variant="outline"      
                onClick={handleSaveForMe}           
                className={cx('space-x-3', { 'opacity-50': disableSaveButton })}
                disabled={disableSaveButton}
            >
                <User2 className='w-4 h-4' />
                <span>Save for myself</span>
            </Button>
            <Button 
                variant="outline"  
                onClick={handleShare}
                disabled={disableShareButton}                
                className={cx('space-x-3', { 'opacity-50': disableShareButton })}                    
            >
                <ShareIcon className='w-4 h-4' />
                <span>Share to client</span>
            </Button>
        </div>
    )
}