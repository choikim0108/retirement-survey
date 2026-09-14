'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function ResultContent() {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  
  useEffect(() => {
    const resultStr = sessionStorage.getItem('surveyResult');
    if (!resultStr) {
      router.replace('/');
      return;
    }
    
    try {
      const result = JSON.parse(resultStr);
      if (typeof result.score === 'number') {
        setScore(result.score);
      } else {
        router.replace('/');
      }
    } catch (e) {
      router.replace('/');
    }
  }, [router]);

  if (score === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  let grade = '';
  let message = '';
  let colorClass = '';

  if (score >= 80) {
    grade = '골든 시니어';
    message = '완벽한 준비! 춘천시민강사나 사회공헌 활동의 리더로 초대합니다.';
    colorClass = 'text-yellow-600';
  } else if (score >= 60) {
    grade = '실버 로드';
    message = '안정적입니다. 부족한 영역만 보완하면 무결점 노후입니다.';
    colorClass = 'text-blue-600';
  } else if (score >= 40) {
    grade = '옐로 라이트';
    message = '주의가 필요합니다. 1:1 전문 상담을 통해 맞춤형 설계를 받아보세요.';
    colorClass = 'text-orange-500';
  } else {
    grade = '레드 라이트';
    message = '긴급 진단 대상입니다. 재단이 직접 찾아가 해결책을 찾아드립니다.';
    colorClass = 'text-red-600';
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">진단 결과</h1>
        
        <div className="py-8">
          <div className="text-6xl font-black text-blue-600 mb-4">{score}점</div>
          <h2 className={`text-2xl font-bold mb-4 ${colorClass}`}>{grade}</h2>
          <p className="text-gray-600 text-lg leading-relaxed">{message}</p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Link 
            href="/"
            className="block w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            처음으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}