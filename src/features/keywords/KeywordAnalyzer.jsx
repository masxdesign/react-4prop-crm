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
import { Info, Loader2 } from 'lucide-react';
import { analyzeKeywords } from '@/services/keywordsService';
import { ArticleTopicCard } from './ArticleTopicCard';

export function KeywordAnalyzer() {
  const navigate = useNavigate();
  const [seed, setSeed] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const { mutate, data, isPending, error } = useMutation({
    mutationFn: (seedKeyword) => analyzeKeywords(seedKeyword),
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

  return (
    <TooltipProvider>
      <div className="container max-w-4xl py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Keyword Research</h1>
          <p className="text-muted-foreground">
            Find the best article topics based on what people are searching for.
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
                  placeholder="e.g. ai blog generator"
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" disabled={isPending || !seed.trim()} className="mt-auto">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
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
                    We group similar searches together so your content doesn't compete with itself on Google.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">
                Each topic creates one complete blog post covering everything people search for.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.articleTopics.map((topic) => (
                  <ArticleTopicCard
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
      </div>
    </TooltipProvider>
  );
}
