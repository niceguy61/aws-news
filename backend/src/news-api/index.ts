import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    console.log('Event:', JSON.stringify(event));
    console.log('Table name:', process.env.ARTICLES_TABLE);

    if (event.pathParameters?.id) {
      const { Item } = await dynamoClient.send(new GetCommand({
        TableName: process.env.ARTICLES_TABLE,
        Key: { id: event.pathParameters.id }
      }));

      return {
        statusCode: Item ? 200 : 404,
        headers,
        body: JSON.stringify(Item || { message: 'Article not found' })
      };
    }

    // 기본 스캔 (필터 제거)
    const { Items } = await dynamoClient.send(new ScanCommand({
      TableName: process.env.ARTICLES_TABLE,
      Limit: 20
    }));

    console.log('Items found:', Items?.length || 0);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        articles: Items?.sort((a, b) => {
          const dateA = new Date(a.publishedAt || 0).getTime();
          const dateB = new Date(b.publishedAt || 0).getTime();
          return dateB - dateA;
        }) || []
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};