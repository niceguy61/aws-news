'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types/article';
import { getArticle } from '@/lib/api';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ExternalLink, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const categoryLabels = {
  'official-news': '공식 뉴스',
  'official-blog': '공식 블로그', 
  'tech-blog': '기술 블로그',
  'community': '커뮤니티'
};

interface ArticleModalProps {
  articleId: string;
  onClose: () => void;
}

export function ArticleModal({ articleId, onClose }: ArticleModalProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await getArticle(articleId);
        setArticle(data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p>기사를 찾을 수 없습니다.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">기사 상세</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <header className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {categoryLabels[article.category as keyof typeof categoryLabels] || article.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(article.publishedAt), 'yyyy년 MM월 dd일', { locale: ko })}
              </div>
            </div>
            
            <h1 className="text-2xl font-bold leading-tight">
              {article.title || article.originalTitle}
            </h1>
            
            {article.title && (
              <p className="text-sm text-muted-foreground">
                원제: {article.originalTitle}
              </p>
            )}

            <div className="flex gap-1 flex-wrap">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          <Separator />

          <div className="prose prose-gray max-w-none space-y-6">
            {article.content && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">한국어 번역</h3>
                <div className="whitespace-pre-wrap text-gray-700">
                  {article.content}
                </div>
              </div>
            )}
            
            {article.originalContent && (
              <div>
                <h3 className="font-semibold mb-3 text-lg">원문 (English)</h3>
                <div className="whitespace-pre-wrap text-gray-600">
                  {article.originalContent}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-center">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              원문 보기 <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}