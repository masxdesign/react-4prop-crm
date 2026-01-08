import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RevisionNavigator({ total, currentIndex, onNavigate, disabled = false }) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  if (total <= 1) return null;

  return (
    <div className={`flex items-center gap-1 ${disabled ? 'opacity-50' : ''}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={isFirst || disabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xs text-gray-500 min-w-[40px] text-center">
        {currentIndex + 1} / {total}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={isLast || disabled}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
