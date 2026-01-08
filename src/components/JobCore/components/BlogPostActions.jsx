import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function BlogPostActions({ blogPostId, isPublished, needsSync, onPush, onUnpublish, onPublish, isLoading }) {
  const hasBlogPost = !!blogPostId;
  const showSyncButton = hasBlogPost && isPublished && needsSync;
  const showPrimaryButton = !hasBlogPost || showSyncButton;

  return (
    <div className="flex items-center gap-2">
      {showPrimaryButton && (
        <Button onClick={onPush} disabled={isLoading} size="sm">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
          {hasBlogPost ? 'Sync Post' : 'Post to Blog'}
        </Button>
      )}
      {hasBlogPost && (
        isPublished ? (
          <Button onClick={onUnpublish} disabled={isLoading} variant="ghost" size="sm">
            Unpost
          </Button>
        ) : (
          <Button onClick={onPublish} disabled={isLoading} variant="outline" size="sm">
            Post
          </Button>
        )
      )}
    </div>
  );
}
