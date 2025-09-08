Write-Host "?룛截?Building Next.js app..." -ForegroundColor Green
Set-Location ..\frontend
npm run build

Write-Host "?뱾 Uploading to S3..." -ForegroundColor Green
aws s3 sync out/ s3:// --delete

Write-Host "??Frontend deployed successfully!" -ForegroundColor Green
Write-Host "?뵕 Visit: https://aws-news.drumgoon.net" -ForegroundColor Yellow
Read-Host "Press Enter to continue"
