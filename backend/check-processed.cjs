const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

async function checkProcessed() {
  const { Items } = await dynamoClient.send(new ScanCommand({
    TableName: TABLE_NAME
  }));

  console.log(`Total articles: ${Items?.length || 0}\n`);

  Items?.forEach((item, index) => {
    const hasTitle = !!item.title;
    const hasSummary = !!item.summary;
    const hasAwsServices = !!item.awsServices;
    
    const status = hasTitle && hasSummary && hasAwsServices ? '✅' : '❌';
    
    console.log(`${index + 1}. ${status} ${item.originalTitle}`);
    console.log(`   Title: ${hasTitle ? '✅' : '❌'} Summary: ${hasSummary ? '✅' : '❌'} Services: ${hasAwsServices ? '✅' : '❌'}`);
    
    if (!hasTitle || !hasSummary || !hasAwsServices) {
      console.log(`   Missing: ${!hasTitle ? 'title ' : ''}${!hasSummary ? 'summary ' : ''}${!hasAwsServices ? 'awsServices' : ''}`);
    }
    console.log('');
  });
}

checkProcessed();