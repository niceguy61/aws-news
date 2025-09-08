const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const Parser = require('rss-parser');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-northeast-2' }));
const bedrock = new BedrockRuntimeClient({ region: 'ap-northeast-2' });
const parser = new Parser();

const CLAUDE_MODEL_ID = 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0';
console.log(`🤖 Using Claude model: ${CLAUDE_MODEL_ID}`);

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

exports.handler = async () => {
  console.log(`📊 Environment variables:`, {
    ARTICLES_TABLE: process.env.ARTICLES_TABLE,
    AWS_REGION: process.env.AWS_REGION,
    BEDROCK_REGION: process.env.BEDROCK_REGION
  });
  
  const filterDate = new Date();
  filterDate.setMonth(filterDate.getMonth() - 3); // 3개월 전까지
  
  let totalProcessed = 0;
  let totalNew = 0;
  
  for (const feedConfig of RSS_FEEDS) {
    try {
      console.log(`Processing feed: ${feedConfig.url}`);
      const feed = await parser.parseURL(feedConfig.url);
      
      for (const item of feed.items.slice(0, 30)) {
        const publishedDate = new Date(item.pubDate || new Date());
        
        if (publishedDate < filterDate) {
          continue;
        }
        
        const articleId = Buffer.from(item.link || '').toString('base64');
        
        const originalTitle = item.title || '';
        const originalContent = item.contentSnippet || item.content || '';
        const language = feedConfig.url.includes('/ko/') ? 'ko' : 'en';
        
        try {
          // AI 처리 수행
          let translatedTitle, translatedContent;
          
          if (language === 'ko') {
            translatedTitle = originalTitle;
            translatedContent = originalContent;
          } else {
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
            summary: originalContent.substring(0, 200) + '...', // RSS 요약 사용
            awsServices,
            link: item.link || '',
            publishedAt: item.pubDate || new Date().toISOString(),
            category: feedConfig.category,
            tags: feedConfig.tags,
            language,
            updatedAt: new Date().toISOString()
          };

          console.log(`💾 Saving to table: ${process.env.ARTICLES_TABLE}`);
          await dynamoClient.send(new PutCommand({
            TableName: process.env.ARTICLES_TABLE,
            Item: article
          }));
          
          totalNew++;
          console.log(`✅ Processed: ${translatedTitle}`);
        } catch (error) {
          console.error(`❌ Processing error for ${originalTitle}:`, {
            name: error.name,
            message: error.message,
            code: error.code,
            statusCode: error.$metadata?.httpStatusCode,
            requestId: error.$metadata?.requestId,
            stack: error.stack
          });
        }
        
        totalProcessed++;
      }
    } catch (error) {
      console.error(`❌ Feed error ${feedConfig.url}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
  
  console.log(`🎉 Collection completed: ${totalNew} new articles out of ${totalProcessed} processed`);
};

async function translateText(text) {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `다음 영어 텍스트를 자연스러운 한국어로 번역해주세요. HTML 태그나 마크다운 문법 없이 순수한 텍스트로만 번역해주세요. 번역된 한국어만 반환하고 다른 설명은 하지 마세요:\n\n${text}`
      }]
    })
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text.trim();
}



async function extractAwsServices(text) {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `다음 텍스트에서 언급된 AWS 서비스들을 추출해주세요. 배열 형태로 반환하고, 서비스명만 포함해주세요 (예: ["EC2", "S3", "Lambda"]):\n\n${text}`
      }]
    })
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  try {
    return JSON.parse(result.content[0].text.trim());
  } catch {
    return [];
  }
}