'use client';

import { useRouter } from 'next/navigation';
import { plans } from '@/data/surveyData';

export default function Home() {
  const router = useRouter();

  const startSurvey = (planId: string) => {
    router.push(`/survey?plan=${planId}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">노후준비 진단</h1>
          <p className="text-gray-500">당신의 안정적인 노후를 위한 첫걸음</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => startSurvey('plan1')}
            className="w-full py-4 px-6 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-colors duration-200 border border-blue-200"
          >
            [1안] 간편 진단 (8문항)
          </button>
          <button
            onClick={() => startSurvey('plan2')}
            className="w-full py-4 px-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-semibold transition-colors duration-200 border border-indigo-200"
          >
            [2안] 영역별 심층 진단 (15문항)
          </button>
        </div>
      </div>
    </main>
  );
}