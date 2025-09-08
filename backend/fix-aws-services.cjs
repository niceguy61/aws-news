const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const CLAUDE_MODEL_ID = 'apac.anthropic.claude-3-7-sonnet-20250219-v1:0';
const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

async function fixAwsServices() {
  const { Items } = await dynamoClient.send(new ScanCommand({
    TableName: TABLE_NAME
  }));

  console.log(`Processing ${Items?.length || 0} articles for AWS services\n`);

  for (const article of Items || []) {
    try {
      console.log(`Processing: ${article.originalTitle}`);
      
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

      console.log(`✅ Updated: ${JSON.stringify(awsServices)}\n`);
      
      // API 제한을 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed: ${article.id}`, error.message);
    }
  }
  
  console.log('🎉 All articles updated with AWS services!');
}

async function extractAwsServices(text) {
  const response = await bedrock.send(new InvokeModelCommand({
    modelId: CLAUDE_MODEL_ID,
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `다음 텍스트에서 언급된 AWS 서비스들을 추출해주세요. 정확한 서비스명을 사용하고 JSON 배열로 반환해주세요. 예시: ["EC2", "S3", "Lambda", "RDS", "CloudFront", "API Gateway", "DynamoDB", "SageMaker", "Bedrock", "Aurora", "DocumentDB", "ECS", "EKS", "VPC", "IAM", "CloudWatch", "EventBridge", "SNS", "SQS", "Step Functions"]

텍스트: ${text.slice(0, 1000)}`
      }]
    })
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  try {
    const extracted = result.content[0].text.trim();
    // JSON 배열 부분만 추출
    const jsonMatch = extracted.match(/\[.*?\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    return [];
  }
}

fixAwsServices();