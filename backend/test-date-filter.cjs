// 현재 필터 로직 테스트
const filterDate = new Date();
filterDate.setFullYear(filterDate.getFullYear() - 1);

console.log(`Current date: ${new Date().toISOString()}`);
console.log(`Filter date (1 year ago): ${filterDate.toISOString()}`);

// 테스트 날짜들
const testDates = [
  'Thu, 28 Aug 2025 19:35:40 +0000',
  'Mon, 01 Sep 2025 22:06:17 +0000', 
  'Wed, 27 May 2024 13:45:53 +0000'
];

testDates.forEach(dateStr => {
  const publishedDate = new Date(dateStr);
  const isRecent = publishedDate >= filterDate;
  
  console.log(`${dateStr} -> ${publishedDate.toISOString()} -> ${isRecent ? '✅ RECENT' : '❌ OLD'}`);
});