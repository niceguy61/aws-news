import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Rss, Database, Bot, Globe, Github } from 'lucide-react';

export default function AboutPage() {
  const rssFeeds = [
    {
      name: 'AWS What\'s New',
      url: 'https://aws.amazon.com/about-aws/whats-new/recent/feed/',
      category: '공식 뉴스',
      description: 'AWS 신규 서비스 및 기능 발표'
    },
    {
      name: 'AWS Official Blog',
      url: 'https://aws.amazon.com/blogs/aws/feed/',
      category: '공식 블로그',
      description: 'AWS 공식 블로그 포스트'
    },
    {
      name: 'AWS Architecture Blog',
      url: 'https://aws.amazon.com/blogs/architecture/feed/',
      category: '기술 블로그',
      description: '아키텍처 및 설계 패턴'
    },
    {
      name: 'AWS Developer Blog',
      url: 'https://aws.amazon.com/blogs/developer/feed/',
      category: '기술 블로그',
      description: '개발자 도구 및 SDK'
    },
    {
      name: 'AWS DevOps Blog',
      url: 'https://aws.amazon.com/blogs/devops/feed/',
      category: '기술 블로그',
      description: 'DevOps 및 자동화'
    },
    {
      name: 'AWS Security Blog',
      url: 'https://aws.amazon.com/blogs/security/feed/',
      category: '기술 블로그',
      description: '보안 및 컴플라이언스'
    },
    {
      name: 'AWS Open Source Blog',
      url: 'https://aws.amazon.com/blogs/opensource/feed/',
      category: '커뮤니티',
      description: '오픈소스 프로젝트'
    },
    {
      name: 'AWS Startups Blog',
      url: 'https://aws.amazon.com/blogs/startups/feed/',
      category: '커뮤니티',
      description: '스타트업 및 혁신'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AWS 뉴스 서비스 소개
        </h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle className="text-amber-500" size={20} />
          <span className="text-lg text-gray-600">
            AWS와 공식적으로 연관되지 않은 개인 프로젝트입니다
          </span>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          AWS 공개 RSS 피드를 수집하여 AI 번역 및 요약 기능을 제공하는 비공식 뉴스 서비스
        </p>
      </div>

      {/* 아키텍처 */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="text-blue-500" />
            시스템 아키텍처
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">데이터 수집 및 처리</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Rss className="text-orange-500" size={20} />
                  <span>1시간마다 RSS 피드 자동 수집</span>
                </div>
                <div className="flex items-center gap-3">
                  <Bot className="text-purple-500" size={20} />
                  <span>Claude 3.7 Sonnet으로 AI 번역/요약</span>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="text-green-500" size={20} />
                  <span>DynamoDB에 처리된 데이터 저장</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">사용 기술</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">AWS Lambda</Badge>
                <Badge variant="secondary">DynamoDB</Badge>
                <Badge variant="secondary">EventBridge</Badge>
                <Badge variant="secondary">Bedrock</Badge>
                <Badge variant="secondary">API Gateway</Badge>
                <Badge variant="secondary">S3</Badge>
                <Badge variant="secondary">CloudFront</Badge>
                <Badge variant="secondary">Next.js 14</Badge>
                <Badge variant="secondary">TypeScript</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RSS 피드 목록 */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="text-orange-500" />
            수집 중인 RSS 피드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {rssFeeds.map((feed, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{feed.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {feed.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{feed.description}</p>
                <a 
                  href={feed.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline break-all"
                >
                  {feed.url}
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 주요 기능 */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>주요 기능</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Bot className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold mb-2">AI 번역</h3>
              <p className="text-sm text-gray-600">
                영문 기사를 자연스러운 한국어로 자동 번역
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Database className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold mb-2">AI 요약</h3>
              <p className="text-sm text-gray-600">
                긴 기사를 핵심 내용으로 간결하게 요약
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="text-purple-600" size={24} />
              </div>
              <h3 className="font-semibold mb-2">실시간 업데이트</h3>
              <p className="text-sm text-gray-600">
                1시간마다 최신 AWS 뉴스 자동 수집
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 개발 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="text-gray-700" />
            개발 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">개발 도구</h4>
              <p className="text-sm text-gray-600">
                이 프로젝트는 <strong>Amazon Q Developer</strong>와 <strong>Kiro</strong>를 활용하여 개발되었습니다.
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">소스 코드</h4>
              <a 
                href="https://github.com/niceguy61/aws-news" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <Github size={16} />
                GitHub에서 소스 코드 보기
              </a>
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-2">라이선스</h4>
              <p className="text-sm text-gray-600">MIT License</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}