const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX';

async function checkSingleArticle() {
  const articleId = 'aHR0cHM6Ly9hd3MuYW1hem9uLmNvbS9ibG9ncy9hd3MvYXdzLXNlcnZpY2VzLXNjYWxlLXRvLW5ldy1oZWlnaHRzLWZvci1wcmltZS1kYXktMjAyNS1rZXktbWV0cmljcy1hbmQtbWlsZXN0b25lcy8=';
  
  console.log(`Checking article ID: ${articleId}`);
  console.log(`Decoded URL: ${Buffer.from(articleId, 'base64').toString()}`);
  
  try {
    const { Item } = await dynamoClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: articleId }
    }));

    if (Item) {
      console.log('✅ Article found in DynamoDB');
      console.log(`Title: ${Item.originalTitle}`);
      console.log(`Has translation: ${!!Item.title}`);
      console.log(`Has summary: ${!!Item.summary}`);
      console.log(`Has AWS services: ${!!Item.awsServices}`);
    } else {
      console.log('❌ Article NOT found in DynamoDB');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSingleArticle();