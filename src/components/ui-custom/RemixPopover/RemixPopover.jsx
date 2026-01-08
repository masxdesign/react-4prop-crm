import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Sparkles, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// AI Rewrite popover for remix functionality
export default function RemixPopover({ field, revisionId, onRemix, isLoading }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    onRemix(field, data.feedback, revisionId);
    setOpen(false);
    reset();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Rewrite
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium">
              Feedback <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('feedback', {
                required: 'Feedback is required',
                minLength: { value: 10, message: 'Minimum 10 characters' }
              })}
              placeholder="e.g., Make it more formal..."
              rows={3}
            />
            {errors.feedback && (
              <p className="text-red-500 text-xs mt-1">{errors.feedback.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Remix
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
