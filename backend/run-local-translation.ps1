# 한글 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

Write-Host "🚀 로컬 AI 번역 시작..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 사전 요구사항:" -ForegroundColor Yellow
Write-Host "  1. Ollama가 설치되어 있어야 함"
Write-Host "  2. gemma2:9b 모델이 다운로드되어 있어야 함"
Write-Host ""
Write-Host "🔄 Ollama 서버 자동 시작 기능 포함" -ForegroundColor Cyan
Write-Host ""

# 환경변수 설정
$env:AWS_PROFILE = "sso"
$env:AWS_REGION = "ap-northeast-2"
$env:ARTICLES_TABLE = "aws-news-service-ArticlesTable-1EO8X7PEQ7WJX"

Write-Host "🔄 미처리 기사 번역 시작..." -ForegroundColor Blue
node local-ai-translator.cjs

Write-Host ""
Write-Host "🎉 번역 완료!" -ForegroundColor Green
Read-Host "계속하려면 Enter를 누르세요"