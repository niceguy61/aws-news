import { getArticles, getAllServices } from '@/lib/api';
import { HomePageClient } from '@/components/home-page-client';

export default async function HomePage() {
  const [articlesResponse, { services }] = await Promise.all([
    getArticles({ limit: 20 }),
    getAllServices()
  ]);

  return (
    <HomePageClient 
      initialArticles={articlesResponse.articles}
      initialServices={services}
      initialHasMore={articlesResponse.hasMore}
      initialLastKey={articlesResponse.lastKey}
    />
  );
}