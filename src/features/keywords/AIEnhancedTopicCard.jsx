import { cn } from '@/lib/utils';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function AIEnhancedTopicCard({ topic, isSelected, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={cn(
        'w-full rounded-lg border transition-colors',
        'hover:bg-muted/50',
        isSelected && 'border-primary bg-primary/5'
      )}
    >
      {/* Main clickable area */}
      <button
        type="button"
        onClick={() => onSelect(topic.id)}
        className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-t-lg"
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
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="font-medium">{topic.label}</span>
              </div>
              <ConfidenceBadge level={topic.confidence} />
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Primary:</span> {topic.primaryKeyword}
            </div>

            {topic.primaryKeywordReason && (
              <div className="text-xs text-muted-foreground/80 italic">
                {topic.primaryKeywordReason}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Covers {topic.keywordCount} related searches
            </div>

            {/* H2 Sections - AI Enhanced with purposes */}
            {topic.suggestedStructure?.h2s?.length > 0 && (
              <div className="text-sm">
                <span className="text-muted-foreground">Article structure:</span>
                <ul className="mt-1 ml-4 space-y-1">
                  {(isExpanded ? topic.suggestedStructure.h2s : topic.suggestedStructure.h2s.slice(0, 4)).map((h2, i) => (
                    <li key={i} className="text-muted-foreground">
                      <span className="font-medium text-foreground">{h2}</span>
                    </li>
                  ))}
                  {!isExpanded && topic.suggestedStructure.h2s.length > 4 && (
                    <li className="text-muted-foreground">
                      +{topic.suggestedStructure.h2s.length - 4} more sections
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* H2 Details with purposes (if available) */}
            {topic.h2Details && topic.h2Details.length > 0 && isExpanded && (
              <div className="mt-3 pt-3 border-t text-sm">
                <span className="text-muted-foreground font-medium">Section details:</span>
                <ul className="mt-2 space-y-2">
                  {topic.h2Details.map((detail, i) => (
                    <li key={i} className="text-muted-foreground">
                      <span className="font-medium text-foreground">{detail.heading}</span>
                      {detail.purpose && (
                        <p className="text-xs mt-0.5 text-muted-foreground/80">{detail.purpose}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Expand/Collapse toggle */}
      {topic.suggestedStructure?.h2s?.length > 4 && (
        <button
          type="button"
          onClick={handleToggleExpand}
          className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 border-t"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show all {topic.suggestedStructure.h2s.length} sections
            </>
          )}
        </button>
      )}
    </div>
  );
}
