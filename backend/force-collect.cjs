const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const Parser = require('rss-parser');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const parser = new Parser();

const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

async function forceCollect() {
  try {
    console.log('=== Force collecting from AWS Blog ===');
    const feed = await parser.parseURL('https://aws.amazon.com/blogs/aws/feed/');
    
    for (const item of feed.items.slice(0, 15)) {
      const articleId = Buffer.from(item.link || '').toString('base64');
      
      const article = {
        id: articleId,
        originalTitle: item.title || '',
        originalContent: item.contentSnippet || item.content || '',
        link: item.link || '',
        publishedAt: item.pubDate || new Date().toISOString(),
        category: 'official-blog',
        tags: ['aws', 'official', 'blog'],
        language: 'en'
      };

      try {
        // 중복 체크 없이 강제 삽입 (덮어쓰기)
        await dynamoClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: article
        }));
        
        console.log(`✅ FORCED: ${article.originalTitle}`);
      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
      }
    }
    
    console.log('🎉 Force collection completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

forceCollect();