import Link from 'next/link';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            AWS 뉴스
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-orange-600">
              홈
            </Link>
            <a 
              href="https://aws.amazon.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm hover:text-orange-600"
            >
              AWS 공식
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}