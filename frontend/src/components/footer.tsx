export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2025 AWS 뉴스. AI 번역 및 요약 서비스</p>
          <div className="flex items-center gap-4">
            <span>Powered by AWS Bedrock</span>
            <span>•</span>
            <span>매시간 업데이트</span>
          </div>
        </div>
      </div>
    </footer>
  );
}