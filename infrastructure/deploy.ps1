# 변수 설정
$STACK_NAME = "aws-news-frontend"
$DOMAIN_NAME = "aws-news.drumgoon.net"

Write-Host "🚀 Deploying S3 bucket..." -ForegroundColor Green

# CloudFormation 스택 배포
aws cloudformation deploy `
  --template-file frontend-stack.yaml `
  --stack-name $STACK_NAME `
  --parameter-overrides `
    DomainName=$DOMAIN_NAME `
  --capabilities CAPABILITY_IAM `
  --region ap-northeast-2

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ S3 bucket deployed successfully!" -ForegroundColor Green
    
    # 출력값 가져오기
    $BUCKET_NAME = aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text --region ap-northeast-2
    
    Write-Host "📦 S3 Bucket: $BUCKET_NAME" -ForegroundColor Yellow
    Write-Host "📝 Now create CloudFront distribution manually and point to this bucket" -ForegroundColor Yellow
    
    # 배포 스크립트 생성
    $deployScript = @"
Write-Host "🏗️ Building Next.js app..." -ForegroundColor Green
Set-Location ..\frontend
npm run build

Write-Host "📤 Uploading to S3..." -ForegroundColor Green
aws s3 sync out/ s3://$BUCKET_NAME --delete

Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
Write-Host "🔗 Visit: https://$DOMAIN_NAME" -ForegroundColor Yellow
Read-Host "Press Enter to continue"
"@
    
    $deployScript | Out-File -FilePath "deploy-frontend.ps1" -Encoding UTF8
    Write-Host "📝 Created deploy-frontend.ps1 script" -ForegroundColor Green
    
} else {
    Write-Host "❌ S3 bucket deployment failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Read-Host "Press Enter to continue"