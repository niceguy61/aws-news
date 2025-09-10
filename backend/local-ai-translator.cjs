const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const axios = require('axios');
const { spawn } = require('child_process');

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-northeast-2' }));

// Ollama API 설정
const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL = 'gemma2:9b';

let wasOllamaRunning = false;

// Ollama 서버 상태 확인 및 자동 시작
async function ensureOllamaRunning() {
  try {
    await axios.get('http://localhost:11434/api/tags', { timeout: 3000 });
    console.log('✅ Ollama 서버 이미 실행 중');
    wasOllamaRunning = true;
    return true;
  } catch (error) {
    console.log('🚀 Ollama 서버 시작 중...');
    wasOllamaRunning = false;
    
    // Ollama 서버 시작
    const ollamaProcess = spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore'
    });
    ollamaProcess.unref();
    
    // 서버 시작 대기
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        await axios.get('http://localhost:11434/api/tags', { timeout: 3000 });
        console.log('✅ Ollama 서버 시작 완료');
        return true;
      } catch {}
    }
    
    throw new Error('Ollama 서버 시작 실패');
  }
}

// Ollama 서버 종료
async function stopOllamaIfStarted() {
  if (!wasOllamaRunning) {
    console.log('🛑 Ollama 서버 종료 중...');
    const { exec } = require('child_process');
    exec('taskkill /f /im ollama.exe', (error) => {
      if (error) {
        console.log('⚠️ Ollama 서버 종료 실패 (수동으로 종료하세요)');
      } else {
        console.log('✅ Ollama 서버 종료 완료');
      }
    });
  } else {
    console.log('ℹ️ Ollama 서버는 이미 실행 중이었으므로 종료하지 않습니다');
  }
}

async function translateWithGemma(text) {
  try {
    const response = await axios.post(OLLAMA_API, {
      model: MODEL,
      prompt: `다음 영어 텍스트를 자연스러운 한국어로 번역해주세요. 번역된 한국어만 반환하고 다른 설명은 하지 마세요:\n\n${text}`,
      stream: false
    });
    
    return response.data.response.trim();
  } catch (error) {
    console.error('Translation error:', error.message);
    return text; // 실패시 원본 반환
  }
}

async function extractAwsServices(text) {
  try {
    const response = await axios.post(OLLAMA_API, {
      model: MODEL,
      prompt: `다음 텍스트에서 언급된 AWS 서비스들을 추출해주세요. JSON 배열 형태로만 반환해주세요 (예: ["EC2", "S3", "Lambda"]):\n\n${text}`,
      stream: false
    });
    
    const result = response.data.response.trim();
    return JSON.parse(result);
  } catch (error) {
    console.error('AWS services extraction error:', error.message);
    return [];
  }
}

async function processUnprocessedArticles() {
  // Ollama 서버 확인 및 시작
  await ensureOllamaRunning();
  
  console.log('🔍 미처리 기사 검색 중...');
  
  // 번역되지 않은 기사들 찾기 (title === originalTitle인 경우)
  const scanResult = await dynamoClient.send(new ScanCommand({
    TableName: process.env.ARTICLES_TABLE || 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX',
    FilterExpression: '#lang = :lang AND size(content) < :minSize',
    ExpressionAttributeNames: {
      '#lang': 'language'
    },
    ExpressionAttributeValues: {
      ':lang': 'en',
      ':minSize': 500
    }
  }));
  
  const unprocessedArticles = scanResult.Items || [];
  console.log(`📊 미처리 기사 ${unprocessedArticles.length}개 발견`);
  
  for (let i = 0; i < unprocessedArticles.length; i++) {
    const article = unprocessedArticles[i];
    console.log(`\n🔄 처리 중 (${i + 1}/${unprocessedArticles.length}): ${article.originalTitle.substring(0, 50)}...`);
    
    try {
      // 제목과 내용 번역
      const [translatedTitle, translatedContent] = await Promise.all([
        translateWithGemma(article.originalTitle),
        translateWithGemma(article.originalContent)
      ]);
      
      // AWS 서비스 추출
      const awsServices = await extractAwsServices(article.originalTitle + ' ' + article.originalContent);
      
      // 요약 생성
      const summaryResponse = await axios.post(OLLAMA_API, {
        model: MODEL,
        prompt: `다음 기사를 3-4문장으로 요약해주세요:\n\n${translatedContent}`,
        stream: false
      });
      const summary = summaryResponse.data.response.trim();
      
      // DynamoDB 업데이트
      await dynamoClient.send(new UpdateCommand({
        TableName: process.env.ARTICLES_TABLE || 'aws-news-service-ArticlesTable-1EO8X7PEQ7WJX',
        Key: { id: article.id },
        UpdateExpression: 'SET title = :title, content = :content, summary = :summary, awsServices = :services, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':title': translatedTitle,
          ':content': translatedContent,
          ':summary': summary,
          ':services': awsServices,
          ':updatedAt': new Date().toISOString()
        }
      }));
      
      console.log(`✅ 완료: ${translatedTitle.substring(0, 50)}...`);
      
      // GPU 과부하 방지를 위한 딜레이
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ 처리 실패: ${article.originalTitle}`, error.message);
    }
  }
  
  console.log(`\n🎉 처리 완료! ${unprocessedArticles.length}개 기사 번역됨`);
  
  // 작업 완료 후 Ollama 서버 종료
  await stopOllamaIfStarted();
}

// 실행
if (require.main === module) {
  processUnprocessedArticles().catch(console.error);
}

module.exports = { processUnprocessedArticles, translateWithGemma, extractAwsServices, stopOllamaIfStarted };