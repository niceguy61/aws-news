const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const region = 'ap-northeast-2';
const bedrock = new BedrockRuntimeClient({ region });
const modelId = 'apac.anthropic.claude-3-5-sonnet-20240620-v1:0';

async function translateText(text) {
  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `다음 영어 텍스트를 자연스러운 한국어로 번역해주세요. HTML 태그나 마크다운 문법 없이 순수한 텍스트로만 번역해주세요. 번역된 한국어만 반환하고 다른 설명은 하지 마세요:\n\n${text}`
      }]
    })
  });
  
  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text.trim();
}

async function extractAwsServices(text) {
  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `다음 텍스트에서 언급된 AWS 서비스들을 추출해주세요. 배열 형태로 반환하고, 서비스명만 포함해주세요 (예: ["EC2", "S3", "Lambda"]):\n\n${text}`
      }]
    })
  });
  
  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  try {
    return JSON.parse(result.content[0].text.trim());
  } catch {
    return [];
  }
}

module.exports = { translateText, extractAwsServices };