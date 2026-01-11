import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import BlogPostActions from './BlogPostActions';

// Contextual help text based on blog post state
function getHelpText(hasBlogPost, isPublished, needsSync) {
  if (!hasBlogPost) {
    // Before publishing
    return "Edit content below, then click 'Post to Blog' to publish. Use Remix to regenerate sections with AI feedback.";
  }
  if (needsSync) {
    // Published with pending changes
    return "You have unsaved changes. Click Sync to push your edits to the live post, or continue editing.";
  }
  // Published, no pending changes
  return "Post is live. Edit content here as a draft, then Sync to update the live version. Use Unpost to take it offline.";
}

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
  const hasBlogPost = !!blogPostId;
  const helpText = getHelpText(hasBlogPost, isPublished, needsSync);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>
            <p className="text-xs text-muted-foreground">{helpText}</p>
            {hasBlogPost && (
              <div className="flex gap-1.5">
                <Badge variant={isPublished ? 'default' : 'secondary'}>
                  {isPublished ? 'Published' : 'Unpublished'}
                </Badge>
                {isPublished && (
                  <Badge variant={needsSync ? 'warning' : 'outline'}>
                    {needsSync ? 'Needs Sync' : 'Synced'}
                  </Badge>
                )}
              </div>
            )}
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
