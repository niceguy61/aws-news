const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async () => {
  try {
    console.log('Starting RSS collection...');
    console.log('Table name:', process.env.ARTICLES_TABLE);

    // 테스트 데이터 삽입
    const testArticle = {
      id: 'test-' + Date.now(),
      originalTitle: 'Test AWS Article',
      originalContent: 'This is a test article content.',
      link: 'https://aws.amazon.com/test',
      publishedAt: new Date().toISOString(),
      category: 'official-news',
      tags: ['aws', 'test'],
      language: 'en'
    };

    await dynamoClient.send(new PutCommand({
      TableName: process.env.ARTICLES_TABLE,
      Item: testArticle
    }));

    console.log('Test article inserted successfully');
    return { statusCode: 200, body: 'Success' };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};