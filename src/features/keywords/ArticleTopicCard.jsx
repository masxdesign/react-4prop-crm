import { cn } from '@/lib/utils';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Check } from 'lucide-react';

export function ArticleTopicCard({ topic, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(topic.id)}
      className={cn(
        'w-full text-left rounded-lg border p-4 transition-colors',
        'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isSelected && 'border-primary bg-primary/5'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Selection indicator */}
        <div
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{topic.label}</span>
            <ConfidenceBadge level={topic.confidence} />
          </div>

          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Primary:</span> {topic.primaryKeyword}
          </div>

          <div className="text-sm text-muted-foreground">
            Covers {topic.keywordCount} related searches
          </div>

          {topic.suggestedStructure?.h2s?.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Suggested sections:</span>
              <ul className="mt-1 ml-4 list-disc text-muted-foreground">
                {topic.suggestedStructure.h2s.slice(0, 4).map((h2, i) => (
                  <li key={i}>{h2}</li>
                ))}
                {topic.suggestedStructure.h2s.length > 4 && (
                  <li>+{topic.suggestedStructure.h2s.length - 4} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
