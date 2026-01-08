import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function JobOutputDialog({
  job,
  open,
  onOpenChange,
  getTitle,
  getDescription,
  children
}) {
  // Get title from config function or fallback (guard against null job)
  const title = (getTitle && job) ? getTitle(job) : 'Job Output';
  const description = (getDescription && job) ? getDescription(job) : 'View and edit job output';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Job Output: {title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
