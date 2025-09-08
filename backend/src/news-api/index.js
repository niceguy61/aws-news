const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

exports.handler = async (event) => {
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
      // URL 디코딩 처리
      const articleId = decodeURIComponent(event.pathParameters.id);
      console.log('Requested article ID:', articleId);
      
      const { Item } = await dynamoClient.send(new GetCommand({
        TableName: process.env.ARTICLES_TABLE,
        Key: { id: articleId }
      }));

      return {
        statusCode: Item ? 200 : 404,
        headers,
        body: JSON.stringify(Item || { message: 'Article not found' })
      };
    }
    
    // 서비스 목록 요청
    if (event.path === '/services') {
      const { Items } = await dynamoClient.send(new ScanCommand({
        TableName: process.env.ARTICLES_TABLE,
        ProjectionExpression: 'awsServices'
      }));
      
      const services = new Set();
      Items?.forEach(item => {
        item.awsServices?.forEach(service => services.add(service));
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ services: Array.from(services).sort() })
      };
    }

    // 쿼리 파라미터 파싱
    const queryParams = event.queryStringParameters || {};
    const { service, limit = '20', lastKey } = queryParams;
    
    // 전체 데이터를 가져와서 날짜순 정렬 후 페이지네이션
    let allItems = [];
    let scanParams = {
      TableName: process.env.ARTICLES_TABLE
    };
    
    // AWS 서비스 필터
    if (service) {
      scanParams.FilterExpression = 'contains(awsServices, :service)';
      scanParams.ExpressionAttributeValues = {
        ':service': service
      };
    }
    
    // 모든 데이터 가져오기
    let lastEvaluatedKey = null;
    do {
      if (lastEvaluatedKey) {
        scanParams.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const { Items: batchItems, LastEvaluatedKey } = await dynamoClient.send(new ScanCommand(scanParams));
      allItems = allItems.concat(batchItems || []);
      lastEvaluatedKey = LastEvaluatedKey;
    } while (lastEvaluatedKey);
    
    // 날짜순 정렬
    allItems.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });
    
    // 페이지네이션 처리
    const startIndex = lastKey ? parseInt(lastKey) : 0;
    const endIndex = startIndex + parseInt(limit);
    const Items = allItems.slice(startIndex, endIndex);
    const hasMoreItems = endIndex < allItems.length;
    const nextLastKey = hasMoreItems ? endIndex.toString() : null;

    console.log('Items found:', Items?.length || 0);
    console.log('Total items:', allItems.length);
    console.log('Start index:', startIndex);
    console.log('Has more:', hasMoreItems);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        articles: Items,
        lastKey: nextLastKey,
        hasMore: hasMoreItems
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};