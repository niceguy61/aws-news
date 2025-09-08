import { Article } from '@/types/article';

const API_BASE_URL = 'https://13q4c9sju6.execute-api.ap-northeast-2.amazonaws.com/Prod';

interface GetArticlesParams {
  service?: string;
  limit?: number;
  lastKey?: string;
}

interface GetArticlesResponse {
  articles: Article[];
  lastKey?: string;
  hasMore: boolean;
}

export async function getArticles(params: GetArticlesParams = {}): Promise<GetArticlesResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.service) searchParams.set('service', params.service);
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.lastKey) searchParams.set('lastKey', params.lastKey);
    
    const url = `${API_BASE_URL}/articles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      cache: 'no-store' // 인피니티 스크롤을 위해 캐시 비활성화
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return { articles: [], hasMore: false };
  }
}

export async function getAllServices(): Promise<{ services: string[] }> {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      return { services: [] };
    }
    
    return response.json();
  } catch {
    return { services: [] };
  }
}

export async function getArticle(id: string): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    next: { revalidate: 300 }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch article');
  }
  
  return response.json();
}