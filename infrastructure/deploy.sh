#!/bin/bash

# 변수 설정
STACK_NAME="aws-news-frontend"
DOMAIN_NAME="aws-news.drumgoon.net"
CERTIFICATE_ARN="arn:aws:acm:us-east-1:261250906071:certificate/8eb766bd-f5ca-47d4-884d-e9c3b9688416"  # 실제 인증서 ARN으로 변경

echo "🚀 Deploying frontend infrastructure..."

# CloudFormation 스택 배포
aws cloudformation deploy \
  --template-file frontend-stack.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides \
    DomainName=$DOMAIN_NAME \
    CertificateArn=$CERTIFICATE_ARN \
  --capabilities CAPABILITY_IAM \
  --region ap-northeast-2

if [ $? -eq 0 ]; then
  echo "✅ Infrastructure deployed successfully!"
  
  # 출력값 가져오기
  BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
    --output text \
    --region ap-northeast-2)
  
  DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
    --output text \
    --region ap-northeast-2)
  
  echo "📦 S3 Bucket: $BUCKET_NAME"
  echo "🌐 CloudFront Distribution: $DISTRIBUTION_ID"
  echo "🔗 Website URL: https://$DOMAIN_NAME"
  
  # 배포 스크립트 생성
  cat > deploy-frontend.sh << EOF
#!/bin/bash
echo "🏗️  Building Next.js app..."
cd ../frontend
npm run build

echo "📤 Uploading to S3..."
aws s3 sync out/ s3://$BUCKET_NAME --delete

echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "✅ Frontend deployed successfully!"
echo "🔗 Visit: https://$DOMAIN_NAME"
EOF
  
  chmod +x deploy-frontend.sh
  echo "📝 Created deploy-frontend.sh script"
  
else
  echo "❌ Infrastructure deployment failed!"
  exit 1
fi