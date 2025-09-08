import Link from 'next/link';
import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold text-orange-600">
              AWS 뉴스
            </Link>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Unofficial
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-orange-600">
              홈
            </Link>
            <Link href="/about" className="text-sm hover:text-orange-600">
              소개
            </Link>
            <a 
              href="https://github.com/niceguy61/aws-news" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:text-orange-600"
            >
              <Github size={16} />
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}