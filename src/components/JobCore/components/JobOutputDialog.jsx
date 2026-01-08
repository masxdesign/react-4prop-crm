import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BlogPostActions from './BlogPostActions';

export default function JobOutputDialog({
  job,
  open,
  onOpenChange,
  getTitle,
  getDescription,
  blogPostId,
  isPublished,
  needsSync,
  onPush,
  onUnpublish,
  onPublish,
  isPublishing,
  children
}) {
  // Get title from config function or fallback (guard against null job)
  const title = (getTitle && job) ? getTitle(job) : 'Job Output';
  const description = (getDescription && job) ? getDescription(job) : 'View and edit job output';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <DialogTitle>Job Output: {title}</DialogTitle>
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
          </div>
          {onPush && (
            <BlogPostActions
              blogPostId={blogPostId}
              isPublished={isPublished}
              needsSync={needsSync}
              onPush={onPush}
              onUnpublish={onUnpublish}
              onPublish={onPublish}
              isLoading={isPublishing}
            />
          )}
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
