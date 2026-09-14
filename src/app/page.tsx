'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    ageGroup: ''
  });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const startSurvey = (planId: string) => {
    if (!userInfo.name || !userInfo.phone || !userInfo.ageGroup) {
      setError('개인정보를 모두 입력해주세요.');
      return;
    }
    if (!consent) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    // Save to sessionStorage
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
    
    router.push(`/survey?plan=${planId}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">노후준비 진단</h1>
          <p className="text-gray-500">당신의 안정적인 노후를 위한 첫걸음</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h2 className="text-sm font-bold text-gray-700">기본 정보 입력</h2>
            <input 
              type="text" 
              name="name"
              placeholder="이름"
              value={userInfo.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="tel" 
              name="phone"
              placeholder="연락처 (예: 010-1234-5678)"
              value={userInfo.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="ageGroup"
              value={userInfo.ageGroup}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">연령대 선택</option>
              <option value="39세 이하">39세 이하</option>
              <option value="40~49세">40~49세</option>
              <option value="50~59세">50~59세</option>
              <option value="60~64세">60~64세</option>
              <option value="65세 이상">65세 이상</option>
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-600 mt-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="rounded text-blue-600 w-4 h-4"
              />
              <span>개인정보 수집 및 이용에 동의합니다.</span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <div className="space-y-3 pt-2">
            <button
              onClick={() => startSurvey('plan1')}
              className="w-full py-4 px-6 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold transition-colors duration-200 border border-blue-200"
            >
              [1안] 간편 진단 (8문항) 시작하기
            </button>
            <button
              onClick={() => startSurvey('plan2')}
              className="w-full py-4 px-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-semibold transition-colors duration-200 border border-indigo-200"
            >
              [2안] 심층 진단 (15문항) 시작하기
            </button>
          </div>
        </div>
      </div>
      
      {/* 관리자 페이지 진입 버튼 */}
      <Link 
        href="/admin"
        className="absolute bottom-4 right-4 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        Admin
      </Link>
    </main>
  );
}