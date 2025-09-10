@echo off
chcp 65001 > nul
echo 🚀 로컬 AI 번역 시작...
echo.
echo 📋 사전 요구사항:
echo   1. Ollama가 설치되어 있어야 함
echo   2. gemma2:9b 모델이 다운로드되어 있어야 함
echo.
echo 🔄 Ollama 서버 자동 시작 기능 포함
echo.

REM 환경변수 설정
set AWS_PROFILE=sso
set AWS_REGION=ap-northeast-2
set ARTICLES_TABLE=aws-news-articles

echo 🔄 미처리 기사 번역 시작...
node local-ai-translator.js

echo.
echo 🎉 번역 완료!
pause