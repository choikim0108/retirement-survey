'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: '',
    ageGroup: ''
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const startSurvey = (planId: string) => {
    const newErrors: string[] = [];
    const nameStr = userInfo.name.trim();
    
    // 닉네임 검증
    if (!nameStr) {
      newErrors.push('닉네임을 입력해주세요.');
    } // 1자 이상이면 패스

    // 연령대 검증
    if (!userInfo.ageGroup) {
      newErrors.push('연령대를 선택해주세요.');
    }

    // 동의 검증
    if (!consent) {
      newErrors.push('개인정보 수집 및 이용에 동의해주세요.');
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors([]);

    // Save to sessionStorage
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    router.push(`/survey?plan=${planId}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">노후준비 진단</h1>
          <p className="text-lg text-gray-600">당신의 안정적인 노후를 위한 첫걸음</p>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">기본 정보 입력</h2>
            <input 
              type="text" 
              name="name"
              placeholder="닉네임"
              value={userInfo.name}
              onChange={handleInputChange}
              className="w-full px-5 py-4 rounded-xl border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-500 font-medium bg-white"
            />
            <select
              name="ageGroup"
              value={userInfo.ageGroup}
              onChange={handleInputChange}
              className="w-full px-5 py-4 rounded-xl border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900 bg-white font-medium"
            >
              <option value="" className="text-gray-500">연령대 선택</option>
              <option value="39세 이하">39세 이하</option>
              <option value="40~49세">40~49세</option>
              <option value="50~59세">50~59세</option>
              <option value="60~64세">60~64세</option>
              <option value="65세 이상">65세 이상</option>
            </select>
            <label className="flex items-center space-x-3 text-base font-medium text-gray-800 mt-4 cursor-pointer">
              <input 
                type="checkbox" 
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="rounded text-blue-600 w-5 h-5 border-gray-400"
              />
              <span>개인정보 수집 및 이용에 동의합니다.</span>
            </label>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-1">
              {errors.map((err, idx) => (
                <p key={idx} className="text-red-600 text-base font-bold text-center">
                  • {err}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-4 pt-4">
            <button
              onClick={() => startSurvey('plan1')}
              className="w-full py-5 px-6 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-2xl font-bold text-xl transition-colors duration-200 border border-blue-200 shadow-sm"
            >
              [1안] 간편 진단 (8문항) 시작
            </button>
            <button
              onClick={() => startSurvey('plan2')}
              className="w-full py-5 px-6 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 rounded-2xl font-bold text-xl transition-colors duration-200 border border-indigo-200 shadow-sm"
            >
              [2안] 심층 진단 (15문항) 시작
            </button>
          </div>
        </div>
      </div>
      
      {/* 춘천미래동행재단 로고 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <img src="/logo.png" alt="춘천미래동행재단" className="h-10 object-contain opacity-80" />
      </div>

      {/* 관리자 페이지 진입 버튼 */}
      <Link 
        href="/admin"
        className="absolute bottom-6 right-6 text-sm text-gray-400 hover:text-gray-600 font-bold transition-colors"
      >
        관리자 모드
      </Link>
    </main>
  );
}