'use client';

import { useState } from 'react';
import { Article } from '@/types/article';
import { InfiniteArticles } from './infinite-articles';
import { ArticleModal } from './article-modal';

interface HomePageClientProps {
  initialArticles: Article[];
  initialServices: string[];
  initialHasMore: boolean;
  initialLastKey?: string;
}

export function HomePageClient({ 
  initialArticles, 
  initialServices, 
  initialHasMore, 
  initialLastKey 
}: HomePageClientProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const handleArticleClick = (id: string) => {
    setSelectedArticleId(id);
  };

  const handleCloseModal = () => {
    setSelectedArticleId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">최신 AWS 뉴스</h1>
        <p className="text-muted-foreground">
          AI 번역 및 요약으로 빠르게 파악하는 AWS 소식
        </p>
      </div>
      
      <InfiniteArticles 
        initialArticles={initialArticles}
        initialServices={initialServices}
        initialHasMore={initialHasMore}
        initialLastKey={initialLastKey}
        onArticleClick={handleArticleClick}
      />
      
      {selectedArticleId && (
        <ArticleModal 
          articleId={selectedArticleId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}