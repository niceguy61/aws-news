const https = require('https');

function checkAPI() {
  const url = 'https://13q4c9sju6.execute-api.ap-northeast-2.amazonaws.com/Prod/articles';
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`Total articles: ${response.articles?.length || 0}`);
        
        if (response.articles) {
          response.articles.forEach((article, index) => {
            console.log(`${index + 1}. ${article.originalTitle || article.title}`);
          });
        }
      } catch (error) {
        console.error('Parse error:', error);
        console.log('Raw response:', data);
      }
    });
  }).on('error', (error) => {
    console.error('Request error:', error);
  });
}

checkAPI();