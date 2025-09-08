const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const Parser = require('rss-parser');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const eventBridge = new EventBridgeClient({});
const parser = new Parser();

const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

const RSS_FEEDS = [
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
  {
    url: 'https://feeds.feedburner.com/AmazonWebServicesBlog',
    category: 'official-blog',
    tags: ['aws', 'official', 'blog', 'feedburner']
  }
];

async function collectRss() {
  const filterDate = new Date();
  filterDate.setFullYear(filterDate.getFullYear() - 1);
  
  console.log(`Filter date: ${filterDate.toISOString()}`);
  
  for (const feedConfig of RSS_FEEDS) {
    try {
      console.log(`\n=== Processing: ${feedConfig.url} ===`);
      const feed = await parser.parseURL(feedConfig.url);
      
      let newCount = 0;
      let duplicateCount = 0;
      let oldCount = 0;
      
      for (const item of feed.items.slice(0, 50)) {
        const publishedDate = new Date(item.pubDate || new Date());
        
        if (publishedDate < filterDate) {
          oldCount++;
          console.log(`⏰ OLD: ${item.title} (${publishedDate.toISOString()})`);
          continue;
        }
        
        const articleId = Buffer.from(item.link || '').toString('base64').slice(0, 32);
        
        const article = {
          id: articleId,
          originalTitle: item.title || '',
          originalContent: item.contentSnippet || item.content || '',
          link: item.link || '',
          publishedAt: item.pubDate || new Date().toISOString(),
          category: feedConfig.category,
          tags: feedConfig.tags,
          language: feedConfig.url.includes('/ko/') ? 'ko' : 'en'
        };

        try {
          await dynamoClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: article,
            ConditionExpression: 'attribute_not_exists(id)'
          }));

          await eventBridge.send(new PutEventsCommand({
            Entries: [{
              Source: 'aws.news.rss',
              DetailType: 'Article Collected',
              Detail: JSON.stringify({ 
                articleId: article.id,
                category: article.category 
              })
            }]
          }));
          
          newCount++;
          console.log(`✅ NEW: ${article.originalTitle} (${publishedDate.toISOString()})`);
        } catch (dbError) {
          if (dbError.name === 'ConditionalCheckFailedException') {
            duplicateCount++;
            console.log(`🔄 DUPLICATE: ${item.title}`);
          } else {
            throw dbError;
          }
        }
      }
      
      console.log(`📊 Summary - New: ${newCount}, Duplicate: ${duplicateCount}, Old: ${oldCount}`);
      
    } catch (error) {
      console.error(`❌ Error processing feed ${feedConfig.url}:`, error.message);
    }
  }
  
  console.log('\n🎉 RSS collection completed!');
}

collectRss();