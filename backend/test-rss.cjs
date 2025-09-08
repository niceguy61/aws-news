const Parser = require('rss-parser');

const parser = new Parser();

const RSS_FEEDS = [
  {
    url: 'https://aws.amazon.com/ko/about-aws/whats-new/recent/feed/',
    category: 'official-news',
    tags: ['aws', 'official', 'announcement']
  },
  {
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    category: 'official-blog',
    tags: ['aws', 'official', 'blog']
  },
  {
    url: 'https://feeds.feedburner.com/AmazonWebServicesBlog',
    category: 'official-blog',
    tags: ['aws', 'official', 'blog', 'feedburner']
  }
];

async function testRssFeeds() {
  const filterDate = new Date();
  filterDate.setFullYear(filterDate.getFullYear() - 1);
  
  for (const feedConfig of RSS_FEEDS) {
    try {
      console.log(`\n=== Testing: ${feedConfig.url} ===`);
      const feed = await parser.parseURL(feedConfig.url);
      
      console.log(`Feed title: ${feed.title}`);
      console.log(`Total items: ${feed.items.length}`);
      
      let recentCount = 0;
      for (const item of feed.items.slice(0, 10)) {
        const publishedDate = new Date(item.pubDate || new Date());
        
        if (publishedDate >= filterDate) {
          recentCount++;
          console.log(`✅ ${item.title} (${publishedDate.toISOString()})`);
        } else {
          console.log(`❌ OLD: ${item.title} (${publishedDate.toISOString()})`);
        }
      }
      
      console.log(`Recent articles (last year): ${recentCount}`);
      
    } catch (error) {
      console.error(`❌ Error processing feed ${feedConfig.url}:`, error.message);
    }
  }
}

testRssFeeds();