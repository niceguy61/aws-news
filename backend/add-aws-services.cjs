const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const CLAUDE_MODEL_ID = 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0';
const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

async function findArticlesWithoutServices() {
  const { Items } = await dynamoClient.send(new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: 'attribute_not_exists(awsServices) AND attribute_exists(title)',
    Limit: 50
  }));

  console.log(`Found ${Items?.length || 0} articles without AWS services`);
  return Items || [];
}

async function addAwsServices(article) {
  try {
    console.log(`Processing: ${article.title || article.originalTitle}`);
    
    const fullText = (article.originalTitle || '') + ' ' + (article.originalContent || '');
    const awsServices = await extractAwsServices(fullText);

    await dynamoClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: article.id },
      UpdateExpression: 'SET awsServices = :awsServices, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':awsServices': awsServices,
        ':updatedAt': new Date().toISOString()
      }
    }));

    console.log(`✅ Added services: ${JSON.stringify(awsServices)}`);
  } catch (error) {
    console.error(`❌ Failed: ${article.id}`, error.message);
  }
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

async function main() {
  try {
    const articlesWithoutServices = await findArticlesWithoutServices();
    
    for (const article of articlesWithoutServices) {
      await addAwsServices(article);
      // API 호출 제한을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('🎉 All articles updated with AWS services!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();