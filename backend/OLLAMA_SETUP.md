# 🤖 로컬 AI 번역 설정 가이드

## 1. Ollama 설치

### Windows
```bash
# Ollama 다운로드 및 설치
# https://ollama.ai/download 에서 Windows 버전 다운로드
```

### 설치 확인
```bash
ollama --version
```

## 2. Gemma2:9b 모델 다운로드

```bash
# 모델 다운로드 (약 5.4GB)
ollama pull gemma2:9b
```

## 3. Ollama 서버 시작

```bash
# 서버 시작 (백그라운드에서 실행)
ollama serve
```

## 4. 모델 테스트

```bash
# 모델 테스트
ollama run gemma2:9b "Hello, how are you?"
```

## 5. 번역 스크립트 실행

```bash
# 백엔드 디렉토리에서 실행
cd backend
npm install
run-local-translation.bat
```

## 🔧 설정 옵션

### GPU 메모리 설정
```bash
# GPU 메모리 제한 (선택사항)
set OLLAMA_GPU_MEMORY=8GB
```

### 모델 성능 조정
- **gemma2:9b**: 균형잡힌 성능 (권장)
- **gemma2:2b**: 빠른 속도, 낮은 품질
- **gemma2:27b**: 높은 품질, 느린 속도 (16GB+ VRAM 필요)

## 📊 예상 성능

### RTX 3060 (12GB VRAM)
- **모델**: gemma2:9b
- **번역 속도**: 기사당 30-60초
- **메모리 사용량**: 약 6-8GB VRAM
- **동시 처리**: 1개 기사씩 순차 처리

## 🚀 사용법

1. Ollama 서버 시작: `ollama serve`
2. 번역 스크립트 실행: `run-local-translation.bat`
3. 진행상황 모니터링
4. 완료 후 프론트엔드에서 번역된 기사 확인

## 🔍 문제 해결

### Ollama 서버 연결 실패
```bash
# 서버 상태 확인
curl http://localhost:11434/api/tags

# 포트 충돌 시 다른 포트 사용
set OLLAMA_HOST=0.0.0.0:11435
ollama serve
```

### GPU 메모리 부족
```bash
# 더 작은 모델 사용
ollama pull gemma2:2b

# 또는 CPU 모드로 실행
set OLLAMA_NUM_GPU=0
```

### 번역 품질 개선
- 프롬프트 엔지니어링으로 번역 품질 조정
- 더 큰 모델 사용 (VRAM 허용 시)
- 배치 크기 조정으로 일관성 향상