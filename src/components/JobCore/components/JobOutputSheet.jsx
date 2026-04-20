import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import BlogPostActions from './BlogPostActions';

// Contextual help text based on blog post state
function getHelpText(hasBlogPost, isPublished, needsSync) {
  if (!hasBlogPost) {
    return "Edit content below, then click 'Post to Blog' to publish. Use Remix to regenerate sections with AI feedback.";
  }
  if (needsSync) {
    return "You have unsaved changes. Click Sync to push your edits to the live post, or continue editing.";
  }
  return "Post is live. Edit content here as a draft, then Sync to update the live version. Use Unpost to take it offline.";
}

export default function JobOutputSheet({
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
  const title = (getTitle && job) ? getTitle(job) : 'Job Output';
  const description = (getDescription && job) ? getDescription(job) : 'View and edit job output';
  const hasBlogPost = !!blogPostId;
  const helpText = getHelpText(hasBlogPost, isPublished, needsSync);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="flex-shrink-0 pr-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription className="sr-only">
                {description}
              </SheetDescription>
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
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-auto mt-4">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
