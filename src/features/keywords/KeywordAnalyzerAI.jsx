import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import { Info, Loader2, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { analyzeKeywordsAI } from '@/services/keywordsService';
import { AIEnhancedTopicCard } from './AIEnhancedTopicCard';
import { cn } from '@/lib/utils';

export function KeywordAnalyzerAI() {
  const navigate = useNavigate();
  const [seed, setSeed] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: (seedKeyword) => analyzeKeywordsAI(seedKeyword),
    onSuccess: () => setSelectedTopicId(null)
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (seed.trim()) mutate(seed.trim());
  };

  const handleGenerateArticle = () => {
    if (!selectedTopicId || !data) return;
    const topic = data.articleTopics.find((t) => t.id === selectedTopicId);

    navigate({
      to: '/content/generate',
      state: {
        primaryKeyword: topic.primaryKeyword,
        supportingKeywords: topic.supportingKeywords,
        suggestedStructure: topic.suggestedStructure
      }
    });
  };

  const aiEnhancement = data?.aiEnhancement;
  const isAIEnabled = aiEnhancement?.enabled;

  return (
    <TooltipProvider>
      <div className="container max-w-4xl py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">AI Keyword Research</h1>
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-muted-foreground">
            AI-enhanced article planning with smart topic grouping and content structure.
          </p>
        </div>

        {/* Seed Input */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleAnalyze} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="seed">Enter a topic you want to write about</Label>
                <Input
                  id="seed"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="e.g. commercial property investment UK"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" disabled={isPending || !seed.trim()} className="mt-auto">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze with AI
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6 text-destructive">
              {error.message}
            </CardContent>
          </Card>
        )}

        {/* AI Enhancement Status */}
        {data && (
          <Card className={cn(
            'border',
            isAIEnabled ? 'border-purple-500/30 bg-purple-500/5' : 'border-amber-500/30 bg-amber-500/5'
          )}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                {isAIEnabled ? (
                  <>
                    <Zap className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-700 dark:text-purple-400">
                        AI Enhancement Active
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {aiEnhancement.analysisNotes}
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Provider: {aiEnhancement.provider}</span>
                        <span>Model: {aiEnhancement.model}</span>
                        {aiEnhancement.usage && (
                          <span>Tokens: {aiEnhancement.usage.totalTokens?.toLocaleString()}</span>
                        )}
                        {aiEnhancement.cost && (
                          <span>Cost: ${aiEnhancement.cost.totalCostUSD?.toFixed(4)}</span>
                        )}
                        {aiEnhancement.fromAICache && (
                          <span className="text-green-600">Cached</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-700 dark:text-amber-400">
                        AI Enhancement Unavailable
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {aiEnhancement?.fallbackReason || 'Using rule-based analysis instead.'}
                      </div>
                      {aiEnhancement?.error && (
                        <div className="text-xs text-destructive mt-1">
                          Error: {aiEnhancement.error}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exclusions (if AI enabled) */}
        {isAIEnabled && aiEnhancement?.exclusions?.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Excluded Keywords</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    AI filtered out these keywords to prevent content overlap and ensure geographic relevance.
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {aiEnhancement.exclusions.slice(0, 5).map((exclusion, idx) => (
                  <div key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {exclusion.reason === 'off_topic' && '🌍'}
                      {exclusion.reason === 'duplicate_intent' && '🔄'}
                      {exclusion.reason === 'merged' && '➡️'}
                      {exclusion.reason === 'too_broad' && '📏'}
                      {exclusion.reason === 'low_value' && '📉'}
                    </span>
                    <div>
                      <span className="font-medium">{exclusion.keyword}</span>
                      <span className="text-muted-foreground"> — {exclusion.explanation}</span>
                    </div>
                  </div>
                ))}
                {aiEnhancement.exclusions.length > 5 && (
                  <div className="text-sm text-muted-foreground">
                    +{aiEnhancement.exclusions.length - 5} more exclusions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {data?.articleTopics && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Choose one article topic</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    AI has grouped similar searches and created article plans that won't compete with each other on Google.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">
                Each topic creates one complete blog post with AI-generated structure and sections.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.articleTopics.map((topic) => (
                  <AIEnhancedTopicCard
                    key={topic.id}
                    topic={topic}
                    isSelected={selectedTopicId === topic.id}
                    onSelect={setSelectedTopicId}
                  />
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleGenerateArticle} disabled={!selectedTopicId}>
                  {selectedTopicId
                    ? 'Generate Article'
                    : 'Please select one article topic to continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        {data?.summary && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Keywords:</span>{' '}
                  <span className="font-medium">{data.summary.totalKeywords}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Article Topics:</span>{' '}
                  <span className="font-medium">{data.summary.articleTopicCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">High Confidence:</span>{' '}
                  <span className="font-medium text-green-600">{data.summary.highConfidenceTopics}</span>
                </div>
                {data.meta?.analyzedAt && (
                  <div>
                    <span className="text-muted-foreground">Analyzed:</span>{' '}
                    <span className="font-medium">
                      {new Date(data.meta.analyzedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
