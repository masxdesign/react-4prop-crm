import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Sparkles, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const TONE_PRESETS = [
  { label: 'Professional', value: 'Use a formal, business-like tone' },
  { label: 'Friendly', value: 'Use a warm, approachable tone' },
  { label: 'Persuasive', value: 'Use a compelling, sales-driven tone' },
  { label: 'Concise', value: 'Use a brief, to-the-point tone' },
  { label: 'Enthusiastic', value: 'Use an upbeat, energetic tone' },
  { label: 'Authoritative', value: 'Use a confident, expert tone' },
  { label: 'Conversational', value: 'Use a casual, relaxed tone' },
  { label: 'Urgent', value: 'Use a time-sensitive, action-driven tone' },
];

const LOADING_WORDS = [
  'Thinking',
  'Crafting',
  'Polishing',
  'Refining',
  'Creating',
  'Composing',
  'Enhancing',
  'Transforming',
  'Generating',
  'Imagining',
  'Weaving',
  'Perfecting',
];

function getRandomWord(excludeIndex) {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * LOADING_WORDS.length);
  } while (newIndex === excludeIndex);
  return newIndex;
}

function TypingLoader() {
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * LOADING_WORDS.length));
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = LOADING_WORDS[wordIndex] + '...';
    const typingSpeed = isDeleting ? 50 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 800);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setWordIndex(getRandomWord(wordIndex));
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <span className="inline-flex items-center min-w-[110px]">
      {displayText}
      <span className="animate-pulse ml-0.5">|</span>
    </span>
  );
}

// AI Rewrite popover for remix functionality
export default function RemixPopover({ field, revisionId, onRemix, isLoading }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    onRemix(field, data.feedback, revisionId);
    setOpen(false);
    reset();
  };

  const handlePresetClick = (preset) => {
    onRemix(field, preset.value, revisionId);
    setOpen(false);
    reset();
  };

  // When loading, show typing effect on button
  if (isLoading) {
    return (
      <Button
        size="sm"
        disabled
        className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-sky-500 to-teal-400 bg-[length:200%_200%] animate-gradient-shift text-white disabled:opacity-100 disabled:pointer-events-none"
      >
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        <TypingLoader />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-sky-500 to-teal-400 text-white hover:shadow-lg hover:shadow-sky-500/25 transition-shadow"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          AI Rewrite
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Quick tones</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {TONE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className="px-2 py-1 text-xs rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-2 text-xs text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Custom feedback</label>
              <Textarea
                {...register('feedback', {
                  required: 'Feedback is required',
                  minLength: { value: 10, message: 'Minimum 10 characters' }
                })}
                placeholder="e.g., Make it more formal..."
                rows={3}
                className="mt-1.5"
              />
              {errors.feedback && (
                <p className="text-red-500 text-xs mt-1">{errors.feedback.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Remix
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
