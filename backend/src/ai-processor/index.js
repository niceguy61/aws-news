const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const CLAUDE_MODEL_ID = 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0';

exports.handler = async (event) => {
  const { articleId, category } = event.detail;

  const { Item: article } = await dynamoClient.send(new GetCommand({
    TableName: process.env.ARTICLES_TABLE,
    Key: { id: articleId }
  }));

  if (!article || !article.originalTitle || !article.originalContent) {
    console.log(`Skipping article ${articleId}: missing content`);
    return;
  }

  try {
    let translatedTitle, translatedContent;
    
    if (article.language === 'ko') {
      // 한국어 기사는 번역 생략
      translatedTitle = article.originalTitle;
      translatedContent = article.originalContent;
    } else {
      // 영어 기사는 번역 수행
      [translatedTitle, translatedContent] = await Promise.all([
        translateText(article.originalTitle),
        translateText(article.originalContent)
      ]);
    }
    
    const [summary, awsServices] = await Promise.all([
      generateSummary(article.originalContent, category),
      extractAwsServices(article.originalTitle + ' ' + article.originalContent)
    ]);

    await dynamoClient.send(new UpdateCommand({
      TableName: process.env.ARTICLES_TABLE,
      Key: { id: articleId },
      UpdateExpression: 'SET title = :title, content = :content, summary = :summary, awsServices = :awsServices, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':title': translatedTitle,
        ':content': translatedContent,
        ':summary': summary,
        ':awsServices': awsServices,
        ':updatedAt': new Date().toISOString()
      }
    }));

    console.log(`AI processing completed for article: ${articleId}`);
  } catch (error) {
    console.error(`AI processing failed for ${articleId}:`, error);
  }
};

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