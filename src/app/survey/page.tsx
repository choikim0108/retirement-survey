'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { plans } from '@/data/surveyData';
import { PlanType } from '@/types';

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = (searchParams.get('plan') as PlanType) || 'plan1';
  
  const plan = plans[planId];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // plan이 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!plan) router.replace('/');
  }, [plan, router]);

  if (!plan) return null;

  const currentQuestion = plan.questions[currentIndex];
  const progress = ((currentIndex) / plan.questions.length) * 100;

  const handleSelect = (score: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);

    if (currentIndex < plan.questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200); // 부드러운 전환을 위한 약간의 딜레이
    } else {
      calculateAndFinish(newAnswers);
    }
  };

  const calculateAndFinish = (finalAnswers: Record<number, number>) => {
    let totalScore = 0;
    
    if (planId === 'plan1') {
      // 1안: (총 획득 점수 / 만점(8*5=40)) * 100
      const sum = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
      const maxPossible = plan.questions.length * 5;
      totalScore = (sum / maxPossible) * 100;
    } else {
      // 2안: 각 문항별 획득점수 비율에 가중치를 곱함 = (선택점수/5) * 가중치
      plan.questions.forEach((q) => {
        const score = finalAnswers[q.id] || 0;
        totalScore += (score / 5) * q.weight;
      });
    }

    router.push(`/result?score=${Math.round(totalScore)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pt-12">
      <div className="max-w-xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>진행률</span>
            <span>{currentIndex + 1} / {plan.questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {currentQuestion.area && (
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold mb-4">
              {currentQuestion.area}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-tight">
            Q{currentIndex + 1}. {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt.score)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-gray-700"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SurveyContent />
    </Suspense>
  );
}