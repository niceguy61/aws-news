const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const CLAUDE_MODEL_ID = 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0';
const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

async function processExistingArticles() {
  console.log('🔍 Scanning for unprocessed articles...');
  
  const { Items } = await dynamoClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'attribute_not_exists(title) OR title = :empty',
    ExpressionAttributeValues: {
      ':empty': ''
    }
  }));
  
  console.log(`📝 Found ${Items?.length || 0} unprocessed articles`);
  
  for (const article of Items || []) {
    try {
      console.log(`🔄 Processing: ${article.originalTitle}`);
      
      let translatedTitle, translatedContent;
      
      if (article.language === 'ko') {
        translatedTitle = article.originalTitle;
        translatedContent = article.originalContent;
      } else {
        [translatedTitle, translatedContent] = await Promise.all([
          translateText(article.originalTitle),
          translateText(article.originalContent)
        ]);
      }
      
      const awsServices = await extractAwsServices(article.originalTitle + ' ' + article.originalContent);
      const summary = article.originalContent.substring(0, 200) + '...';
      
      await dynamoClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: article.id },
        UpdateExpression: 'SET title = :title, content = :content, awsServices = :awsServices, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':title': translatedTitle,
          ':content': translatedContent,

          ':awsServices': awsServices,
          ':updatedAt': new Date().toISOString()
        }
      }));
      
      console.log(`✅ Completed: ${translatedTitle}`);
      
      // API 제한을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error processing ${article.originalTitle}:`, error.message);
    }
  }
  
  console.log('🎉 Processing completed!');
}

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

processExistingArticles().catch(console.error);