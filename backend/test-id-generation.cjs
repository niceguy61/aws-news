const Parser = require('rss-parser');
const parser = new Parser();

async function testIdGeneration() {
  const feed = await parser.parseURL('https://aws.amazon.com/blogs/aws/feed/');
  
  console.log('=== Testing ID Generation ===');
  
  const ids = new Set();
  
  for (const item of feed.items.slice(0, 10)) {
    const articleId = Buffer.from(item.link || '').toString('base64').slice(0, 32);
    
    if (ids.has(articleId)) {
      console.log(`🔄 DUPLICATE ID: ${articleId} - ${item.title}`);
    } else {
      console.log(`✅ UNIQUE ID: ${articleId} - ${item.title}`);
      ids.add(articleId);
    }
    
    console.log(`   Link: ${item.link}`);
  }
  
  console.log(`\nTotal unique IDs: ${ids.size}`);
}

testIdGeneration();