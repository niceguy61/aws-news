# 변수 설정
$BUCKET_NAME = "aws-news.drumgoon.net-static"
$DISTRIBUTION_ID = "YOUR_CLOUDFRONT_DISTRIBUTION_ID"  # CloudFront Distribution ID로 변경

Write-Host "🏗️ Building Next.js app..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "📤 Uploading to S3..." -ForegroundColor Green
    aws s3 sync out/ s3://$BUCKET_NAME --delete
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Green
        aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
            Write-Host "🔗 Visit: https://aws-news.drumgoon.net" -ForegroundColor Yellow
        } else {
            Write-Host "❌ CloudFront invalidation failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ S3 upload failed!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
}

Read-Host "Press Enter to continue"