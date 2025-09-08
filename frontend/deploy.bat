@echo off
chcp 65001 >nul

REM 변수 설정
set BUCKET_NAME=aws-news.drumgoon.net-static
set DISTRIBUTION_ID=YOUR_CLOUDFRONT_DISTRIBUTION_ID

echo 🏗️ Building Next.js app...
call npm run build

if %errorlevel% equ 0 (
    echo 📤 Uploading to S3...
    aws s3 sync out/ s3://%BUCKET_NAME% --delete
    
    if %errorlevel% equ 0 (
        echo 🔄 Invalidating CloudFront cache...
        aws cloudfront create-invalidation --distribution-id %DISTRIBUTION_ID% --paths "/*"
        
        if %errorlevel% equ 0 (
            echo ✅ Frontend deployed successfully!
            echo 🔗 Visit: https://aws-news.drumgoon.net
        ) else (
            echo ❌ CloudFront invalidation failed!
        )
    ) else (
        echo ❌ S3 upload failed!
    )
) else (
    echo ❌ Build failed!
)

pause