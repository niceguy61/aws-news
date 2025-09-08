@echo off
chcp 65001 >nul

REM 변수 설정
set STACK_NAME=aws-news-frontend
set DOMAIN_NAME=aws-news.drumgoon.net
set CERTIFICATE_ARN=arn:aws:acm:us-east-1:YOUR_ACCOUNT:certificate/YOUR_CERT_ID

echo 🚀 Deploying frontend infrastructure...

REM CloudFormation 스택 배포
aws cloudformation deploy ^
  --template-file frontend-stack.yaml ^
  --stack-name %STACK_NAME% ^
  --parameter-overrides ^
    DomainName=%DOMAIN_NAME% ^
    CertificateArn=%CERTIFICATE_ARN% ^
  --capabilities CAPABILITY_IAM ^
  --region ap-northeast-2

if %errorlevel% equ 0 (
  echo ✅ Infrastructure deployed successfully!
  
  REM 출력값 가져오기
  for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue" --output text --region ap-northeast-2') do set BUCKET_NAME=%%i
  
  for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --query "Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue" --output text --region ap-northeast-2') do set DISTRIBUTION_ID=%%i
  
  echo 📦 S3 Bucket: %BUCKET_NAME%
  echo 🌐 CloudFront Distribution: %DISTRIBUTION_ID%
  echo 🔗 Website URL: https://%DOMAIN_NAME%
  
  REM 배포 스크립트 생성
  (
    echo @echo off
    echo chcp 65001 ^>nul
    echo echo 🏗️ Building Next.js app...
    echo cd ..\frontend
    echo npm run build
    echo.
    echo echo 📤 Uploading to S3...
    echo aws s3 sync out/ s3://%BUCKET_NAME% --delete
    echo.
    echo echo 🔄 Invalidating CloudFront cache...
    echo aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"
    echo.
    echo echo ✅ Frontend deployed successfully!
    echo echo 🔗 Visit: https://%DOMAIN_NAME%
    echo pause
  ) > deploy-frontend.bat
  
  echo 📝 Created deploy-frontend.bat script
  
) else (
  echo ❌ Infrastructure deployment failed!
  pause
  exit /b 1
)

pause