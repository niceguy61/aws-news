import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar } from 'lucide-react';
import { Article } from '@/types/article';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
// import Link from 'next/link'; // 모달로 대체

interface ArticleCardProps {
  article: Article;
  onArticleClick?: (id: string) => void;
}

const categoryLabels = {
  'official-news': '공식 뉴스',
  'official-blog': '공식 블로그',
  'tech-blog': '기술 블로그',
  'community': '커뮤니티'
};

export function ArticleCard({ article, onArticleClick }: ArticleCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">
            <button 
              onClick={() => onArticleClick?.(article.id)}
              className="hover:text-blue-600 text-left"
            >
              {article.title || article.originalTitle}
            </button>
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {categoryLabels[article.category as keyof typeof categoryLabels] || article.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {format(new Date(article.publishedAt), 'yyyy년 MM월 dd일', { locale: ko })}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {article.content?.slice(0, 150) + '...' || article.originalContent?.slice(0, 150) + '...'}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-1 flex-wrap">
            {article.awsServices?.map((service) => (
              <Badge key={service} variant="default" className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200">
                {service}
              </Badge>
            ))}
          </div>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            원문 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}