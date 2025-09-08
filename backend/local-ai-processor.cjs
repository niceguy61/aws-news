const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const CLAUDE_MODEL_ID = 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0';
const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

async function findUnprocessedArticles() {
  const { Items } = await dynamoClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'attribute_not_exists(title) OR attribute_not_exists(summary)',
    Limit: 50
  }));

  console.log(`Found ${Items?.length || 0} unprocessed articles`);
  return Items || [];
}

async function processArticle(article) {
  if (!article.originalTitle || !article.originalContent) {
    console.log(`Skipping article ${article.id}: missing content`);
    return;
  }

  try {
    console.log(`Processing: ${article.originalTitle}`);
    
    const [translatedTitle, translatedContent, summary] = await Promise.all([
      translateText(article.originalTitle),
      translateText(article.originalContent),
      generateSummary(article.originalContent, article.category)
    ]);

    await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: article.id },
      UpdateExpression: 'SET title = :title, content = :content, summary = :summary, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':title': translatedTitle,
        ':content': translatedContent,
        ':summary': summary,
        ':updatedAt': new Date().toISOString()
      }
    }));

    console.log(`✅ Completed: ${article.id}`);
  } catch (error) {
    console.error(`❌ Failed: ${article.id}`, error.message);
  }
}

async function translateText(text) {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `다음 영어 텍스트를 자연스러운 한국어로 번역해주세요. 번역된 한국어만 반환하고 다른 설명은 하지 마세요:\n\n${text}`
      }]
    })
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text.trim();
}

async function generateSummary(content, category) {
  const categoryContext = {
    'official-news': 'AWS 공식 발표',
    'official-blog': 'AWS 공식 블로그',
    'tech-blog': '기술 블로그',
    'community': '커뮤니티 소식'
  }[category] || 'AWS 뉴스';

  const response = await bedrock.send(new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `다음 ${categoryContext} 내용을 한국어로 2-3문장으로 요약해주세요. 핵심 내용과 개발자에게 중요한 포인트를 포함해주세요:\n\n${content}`
      }]
    })
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text.trim();
}

async function main() {
  try {
    const unprocessedArticles = await findUnprocessedArticles();
    
    for (const article of unprocessedArticles) {
      await processArticle(article);
      // API 호출 제한을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🎉 All articles processed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();