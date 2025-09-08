const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const Parser = require('rss-parser');
const { translateText, extractAwsServices } = require('./ai-functions.cjs');

const region = 'ap-northeast-2';
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));
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
        
        const originalTitle = item.title || '';
        const originalContent = item.contentSnippet || item.content || '';
        const language = feedConfig.url.includes('/ko/') ? 'ko' : 'en';
        
        try {
          // 중복 체크 (기존 방식 - GSI 없이)
          try {
            await dynamoClient.send(new PutCommand({
              TableName: TABLE_NAME,
              Item: { id: articleId, link: item.link },
              ConditionExpression: 'attribute_not_exists(id)'
            }));
          } catch (dbError) {
            if (dbError.name === 'ConditionalCheckFailedException') {
              duplicateCount++;
              console.log(`🔄 DUPLICATE: ${originalTitle}`);
              continue;
            }
          }
          
          // 기존 아이템 삭제 (AI 처리 후 다시 저장하기 위해)
          await dynamoClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id: articleId }
          }));
          
          // AI 처리
          let translatedTitle, translatedContent;
          
          if (language === 'ko') {
            translatedTitle = originalTitle;
            translatedContent = originalContent;
          } else {
            console.log(`🤖 AI Processing: ${originalTitle}`);
            [translatedTitle, translatedContent] = await Promise.all([
              translateText(originalTitle),
              translateText(originalContent)
            ]);
          }
          
          const awsServices = await extractAwsServices(originalTitle + ' ' + originalContent);
          
          const article = {
            id: articleId,
            originalTitle,
            originalContent,
            title: translatedTitle,
            content: translatedContent,
            summary: originalContent.substring(0, 200) + '...',
            awsServices,
            link: item.link || '',
            publishedAt: item.pubDate || new Date().toISOString(),
            category: feedConfig.category,
            tags: feedConfig.tags,
            language,
            updatedAt: new Date().toISOString()
          };
          
          await dynamoClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: article
          }));
          
          newCount++;
          console.log(`✅ NEW: ${translatedTitle}`);
        } catch (error) {
          console.error(`❌ ERROR: ${originalTitle}:`, error.message);
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