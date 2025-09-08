import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AWS 뉴스 - 한국어 번역 및 요약',
  description: '최신 AWS 소식을 한국어로 번역하고 요약해서 제공하는 뉴스 서비스',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="pt-20 pb-16 min-h-screen bg-background">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}