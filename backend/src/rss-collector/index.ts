const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');
const Parser = require('rss-parser');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const eventBridge = new EventBridgeClient({});
const parser = new Parser();

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
  }
];

exports.handler = async () => {
  for (const feedConfig of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      
      for (const item of feed.items.slice(0, 10)) { // 최신 10개만 처리
        const articleId = Buffer.from(item.link || '').toString('base64').slice(0, 32);
        
        const article: Partial<Article> = {
          id: articleId,
          originalTitle: item.title || '',
          originalContent: item.contentSnippet || item.content || '',
          link: item.link || '',
          publishedAt: item.pubDate || new Date().toISOString(),
          category: feedConfig.category,
          tags: feedConfig.tags,
          language: 'en'
        };

        try {
          await dynamoClient.send(new PutCommand({
            TableName: process.env.ARTICLES_TABLE,
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
          
          console.log(`New article collected: ${article.originalTitle}`);
        } catch (dbError: any) {
          if (dbError.name !== 'ConditionalCheckFailedException') {
            throw dbError;
          }
        }
      }
    } catch (error) {
      console.error(`Error processing feed ${feedConfig.url}:`, error);
    }
  }
};