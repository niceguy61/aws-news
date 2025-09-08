const https = require('https');

function checkAPIData() {
  const url = 'https://13q4c9sju6.execute-api.ap-northeast-2.amazonaws.com/Prod/articles';
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        console.log(`Total articles: ${response.articles?.length || 0}\n`);
        
        if (response.articles) {
          response.articles.slice(0, 3).forEach((article, index) => {
            console.log(`=== Article ${index + 1} ===`);
            console.log(`ID: ${article.id}`);
            console.log(`Original Title: ${article.originalTitle || 'MISSING'}`);
            console.log(`Translated Title: ${article.title || 'MISSING'}`);
            console.log(`Original Content: ${article.originalContent ? 'EXISTS' : 'MISSING'}`);
            console.log(`Translated Content: ${article.content ? 'EXISTS' : 'MISSING'}`);
            console.log(`Summary: ${article.summary || 'MISSING'}`);
            console.log(`AWS Services: ${article.awsServices ? JSON.stringify(article.awsServices) : 'MISSING'}`);
            console.log(`Published: ${article.publishedAt || 'MISSING'}`);
            console.log('');
          });
        }
      } catch (error) {
        console.error('Parse error:', error);
        console.log('Raw response:', data.substring(0, 500));
      }
    });
  }).on('error', (error) => {
    console.error('Request error:', error);
  });
}

checkAPIData();