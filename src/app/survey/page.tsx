'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { plans } from '@/data/surveyData';
import { PlanType } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = (searchParams.get('plan') as PlanType) || 'plan1';
  
  const plan = plans[planId];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!plan) router.replace('/');
  }, [plan, router]);

  if (!plan) return null;

  const currentQuestion = plan.questions[currentIndex];
  const progress = ((currentIndex) / plan.questions.length) * 100;

  const handleSelect = (score: number) => {
    if (isSubmitting) return;

    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);

    if (currentIndex < plan.questions.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      setTimeout(() => calculateAndFinish(newAnswers), 200);
    }
  };

  const getGrade = (score: number) => {
    if (score >= 80) return '골든 시니어';
    if (score >= 60) return '실버 로드';
    if (score >= 40) return '옐로 라이트';
    return '레드 라이트';
  };

  const calculateAndFinish = async (finalAnswers: Record<number, number>) => {
    setIsSubmitting(true);
    let totalScore = 0;
    
    if (planId === 'plan1') {
      const sum = Object.values(finalAnswers).reduce((a, b) => a + b, 0);
      const maxPossible = plan.questions.length * 5;
      totalScore = (sum / maxPossible) * 100;
    } else {
      plan.questions.forEach((q) => {
        const score = finalAnswers[q.id] || 0;
        totalScore += (score / 5) * q.weight;
      });
    }

    const finalScore = Math.round(totalScore);
    const grade = getGrade(finalScore);

    // Save to sessionStorage for result page
    sessionStorage.setItem('surveyResult', JSON.stringify({ score: finalScore, grade }));

    try {
      const userInfoStr = sessionStorage.getItem('userInfo');
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

      if (userInfo) {
        await addDoc(collection(db, 'survey_results'), {
          ...userInfo,
          planId,
          score: finalScore,
          grade,
          answers: finalAnswers,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error('Error saving document: ', e);
    } finally {
      router.push('/result');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 pt-12">
      <div className="max-w-xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-base font-medium text-gray-500 mb-3">
            <span>진행률</span>
            <span>{currentIndex + 1} / {plan.questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-3xl z-10">
              <p className="text-gray-800 text-lg font-bold">결과를 분석 중입니다...</p>
            </div>
          )}
          
          {currentQuestion.area && (
            <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold mb-6">
              {currentQuestion.area}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-10 leading-snug">
            Q{currentIndex + 1}. {currentQuestion.text}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                type="button" 
                onClick={() => handleSelect(opt.score)}
                disabled={isSubmitting}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-gray-800 font-medium text-xl disabled:opacity-50"
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