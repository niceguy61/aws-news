export interface Article {
  id: string;
  title: string;
  originalTitle: string;
  content: string;
  originalContent: string;
  summary: string;
  originalSummary: string;
  link: string;
  publishedAt: string;
  category: string;
  tags: string[];
  language: 'ko' | 'en';
}