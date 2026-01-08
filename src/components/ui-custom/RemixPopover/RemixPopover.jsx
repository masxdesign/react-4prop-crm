import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// AI Rewrite popover for remix functionality
export default function RemixPopover({ field, onRemix }) {
  const [prompt, setPrompt] = useState('');
  const [open, setOpen] = useState(false);

  const handleRemix = () => {
    onRemix(field, prompt);
    setOpen(false);
    setPrompt('');
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
        <div className="space-y-3">
          <label className="text-sm font-medium">Custom prompt (optional)</label>
          <Textarea
            placeholder="e.g., Make it more formal..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <Button onClick={handleRemix} className="w-full">
            Remix
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
