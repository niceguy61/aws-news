Write-Host "🏗️ Building Next.js SPA..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "📤 Uploading to S3..." -ForegroundColor Green
    
    # 정적 파일 업로드
    aws s3 sync .next/static/ s3://aws-news.drumgoon.net-static/_next/static/ --delete
    
    # 메인 HTML 파일을 index.html로 복사
    aws s3 cp .next/server/pages/index.html s3://aws-news.drumgoon.net-static/index.html
    
    Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Green
    aws cloudfront create-invalidation --distribution-id E1E7R090QDM174 --paths "/*"
    
    Write-Host "✅ SPA deployed successfully!" -ForegroundColor Green
    Write-Host "🔗 Visit: https://aws-news.drumgoon.net" -ForegroundColor Yellow
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}

Read-Host "Press Enter to continue"