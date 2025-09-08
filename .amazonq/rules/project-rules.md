# AWS News Service - Project Rules

## 프로젝트 개요
AWS RSS 피드를 수집하여 AI 번역 및 요약 기능을 제공하는 뉴스 서비스

## 기술 스택
- **Frontend**: React 18 + Next.js 14 (App Router)
- **Backend**: Node.js + AWS Lambda (Serverless)
- **Database**: DynamoDB
- **AI Services**: AWS Bedrock (Claude 3.7 Sonnet)
- **Infrastructure**: AWS SAM
- **Deployment**: Vercel (Frontend), AWS (Backend)

## 아키텍처 원칙
1. **Serverless First**: 모든 백엔드 로직은 Lambda 함수로 구현
2. **Event-Driven**: EventBridge를 통한 비동기 처리
3. **Cost Optimization**: 사용량 기반 과금 최적화
4. **Scalability**: Auto-scaling 고려한 설계

## 코딩 규칙
### Backend (Node.js)
- TypeScript 사용 필수
- ESM 모듈 시스템 사용
- AWS SDK v3 사용
- 환경변수는 AWS Systems Manager Parameter Store 활용
- 에러 핸들링은 AWS X-Ray 트레이싱 포함

### Frontend (React/Next.js)
- TypeScript 사용 필수
- App Router 패턴 사용
- Server Components 우선 사용
- Tailwind CSS + shadcn/ui 컴포넌트
- 반응형 디자인 필수 (모바일 퍼스트)

## 데이터 구조
### RSS 아티클
```typescript
interface Article {
  id: string;
  title: string;
  originalTitle: string;
  content: string;
  originalContent: string;
  summary: string;
  originalSummary: string;
  link: string;
  publishedAt: string;
  category: string;
  tags: string[];
  language: 'ko' | 'en';
}
```

## AWS 서비스 사용 가이드
- **Lambda**: 15분 타임아웃, 1GB 메모리 기본값
- **DynamoDB**: On-demand 빌링, GSI 최소화
- **EventBridge**: 스케줄링 및 이벤트 처리
- **S3**: 정적 자산 및 백업 저장소
- **CloudFront**: CDN 및 캐싱

## 보안 규칙
- IAM 최소 권한 원칙
- API Gateway에서 rate limiting 적용
- 민감한 데이터는 암호화 저장
- CORS 정책 엄격히 적용

## 성능 최적화
- Lambda Cold Start 최소화
- DynamoDB 쿼리 최적화
- 이미지 최적화 (Next.js Image 컴포넌트)
- 적절한 캐싱 전략 적용

## 개발 워크플로우
1. 기능별 Lambda 함수 분리
2. Infrastructure as Code (SAM)
3. 단위 테스트 필수
4. CI/CD 파이프라인 구축