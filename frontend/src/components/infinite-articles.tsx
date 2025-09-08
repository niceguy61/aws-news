'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Article } from '@/types/article';
import { ArticleCard } from './article-card';
import { Badge } from './ui/badge';
// import { Input } from './ui/input'; // 사용하지 않음
import { X, Loader2 } from 'lucide-react';
import { getArticles } from '@/lib/api';

interface GetArticlesParams {
  limit: number;
  lastKey?: string;
  service?: string;
}

interface InfiniteArticlesProps {
  initialArticles: Article[];
  initialServices: string[];
  initialHasMore: boolean;
  initialLastKey?: string;
  onArticleClick?: (id: string) => void;
}

export function InfiniteArticles({ 
  initialArticles, 
  initialServices, 
  initialHasMore,
  initialLastKey,
  onArticleClick 
}: InfiniteArticlesProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [allServices] = useState<string[]>(initialServices);
  const [selectedService, setSelectedService] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [lastKey, setLastKey] = useState<string | undefined>(initialLastKey);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastArticleRef = useRef<HTMLDivElement>(null);

  // 서비스 필터 변경 시 새로운 검색
  useEffect(() => {
    const fetchFilteredArticles = async () => {
      setLoading(true);
      try {
        if (selectedService.trim()) {
          // 부분 일치 검색을 위해 전체 데이터 가져와서 클라이언트에서 필터링
          const response = await getArticles({ limit: 1000 });
          const filteredArticles = response.articles.filter(article => 
            article.awsServices?.some(service => 
              service.toLowerCase().includes(selectedService.toLowerCase())
            )
          );
          setArticles(filteredArticles.slice(0, 20));
          setHasMore(filteredArticles.length > 20);
          setLastKey(undefined);
        } else {
          // 필터 없을 때는 기본 데이터
          const response = await getArticles({ limit: 20 });
          setArticles(response.articles);
          setHasMore(response.hasMore);
          setLastKey(response.lastKey);
        }
      } catch (error) {
        console.error('Failed to fetch filtered articles:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchFilteredArticles, 300); // 디바운스
    return () => clearTimeout(timeoutId);
  }, [selectedService]);

  // 더 많은 기사 로드
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !lastKey) return;
    
    setLoadingMore(true);
    try {
      const params: GetArticlesParams = { limit: 20, lastKey };
      if (selectedService) params.service = selectedService;
      
      const response = await getArticles(params);
      setArticles(prev => [...prev, ...response.articles]);
      setHasMore(response.hasMore);
      setLastKey(response.lastKey);
    } catch (error) {
      console.error('Failed to load more articles:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastKey, selectedService]);

  // Intersection Observer 설정
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastArticleRef.current) {
      observerRef.current.observe(lastArticleRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loadingMore, loadMore]);

  // toggleService 제거 - 직접 입력으로 변경

  const clearFilters = () => {
    setSelectedService('');
  };

  return (
    <div className="space-y-6">


      {/* AWS 서비스 검색 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">AWS 서비스 검색</h3>
          {selectedService && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
              필터 초기화
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="AWS 서비스명 입력 (예: EC2, S3, Lambda...)"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 결과 표시 */}
      <div className="text-sm text-muted-foreground">
        {loading ? '로딩 중...' : `${articles.length}개의 기사`}
        {selectedService && ` ("${selectedService}" 검색 결과)`}
      </div>

      {/* 기사 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div
            key={article.id}
            ref={index === articles.length - 1 ? lastArticleRef : null}
          >
            <ArticleCard article={article} onArticleClick={onArticleClick} />
          </div>
        ))}
      </div>

      {/* 로딩 인디케이터 */}
      {loadingMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {/* 더 이상 로드할 기사가 없을 때 */}
      {!hasMore && articles.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          모든 기사를 불러왔습니다.
        </div>
      )}
    </div>
  );
}