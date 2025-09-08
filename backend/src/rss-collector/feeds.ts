export interface FeedConfig {
  url: string;
  category: string;
  tags: string[];
}

export const RSS_FEEDS: FeedConfig[] = [
  // 공식 뉴스
  {
    url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
    category: 'official-news',
    tags: ['aws', 'official', 'announcement']
  },
  {
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    category: 'official-blog',
    tags: ['aws', 'official', 'blog']
  },
  
  // 기술 블로그
  {
    url: 'https://aws.amazon.com/blogs/architecture/feed/',
    category: 'tech-blog',
    tags: ['architecture', 'technical', 'best-practices']
  },
  {
    url: 'https://aws.amazon.com/blogs/developer/feed/',
    category: 'tech-blog',
    tags: ['developer', 'technical', 'sdk']
  },
  {
    url: 'https://aws.amazon.com/blogs/devops/feed/',
    category: 'tech-blog',
    tags: ['devops', 'technical', 'automation']
  },
  {
    url: 'https://aws.amazon.com/blogs/security/feed/',
    category: 'tech-blog',
    tags: ['security', 'technical', 'compliance']
  },
  
  // 커뮤니티 소식
  {
    url: 'https://aws.amazon.com/blogs/opensource/feed/',
    category: 'community',
    tags: ['opensource', 'community', 'contribution']
  },
  {
    url: 'https://aws.amazon.com/blogs/startups/feed/',
    category: 'community',
    tags: ['startups', 'community', 'innovation']
  }
];