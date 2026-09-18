'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { plans } from '@/data/surveyData';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin1234';
    if (password === validPassword) {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'survey_results'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const results: any[] = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setData(results);
    } catch (e) {
      console.error(e);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">관리자 로그인</h1>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-4 pr-12 rounded-lg border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-semibold"
            >
              {showPassword ? "숨기기" : "보기"}
            </button>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-bold hover:bg-blue-700">
            접속
          </button>
        </form>
      </div>
    );
  }

  // --- 통계 계산 ---
  const totalParticipants = data.length;
  
  // 등급별 분포
  const gradeCount = data.reduce((acc, curr) => {
    acc[curr.grade] = (acc[curr.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 연령대별 분포
  const ageCount = data.reduce((acc, curr) => {
    const age = curr.ageGroup || '미상';
    acc[age] = (acc[age] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 안(Plan)별 평균 점수
  const planStats = data.reduce((acc, curr) => {
    const p = curr.planId;
    if (!acc[p]) acc[p] = { sum: 0, count: 0 };
    acc[p].sum += curr.score;
    acc[p].count += 1;
    return acc;
  }, {} as Record<string, { sum: number, count: number }>);

  // 안별 문항 평균 응답 점수
  const qStats = data.reduce((acc, curr) => {
    const p = curr.planId;
    if (!acc[p]) acc[p] = {};
    if (curr.answers) {
      Object.entries(curr.answers).forEach(([qId, score]: [string, any]) => {
        if (!acc[p][qId]) acc[p][qId] = { sum: 0, count: 0 };
        acc[p][qId].sum += score;
        acc[p][qId].count += 1;
      });
    }
    return acc;
  }, {} as Record<string, Record<string, { sum: number, count: number }>>);

  // --- 추가된 유의미한 통계 ---
  // 1. 연령대별 평균 총점 (어느 연령대가 가장 노후 준비가 취약한지 파악)
  const ageScoreStats = data.reduce((acc, curr) => {
    const age = curr.ageGroup || '미상';
    if (!acc[age]) acc[age] = { sum: 0, count: 0 };
    acc[age].sum += curr.score;
    acc[age].count += 1;
    return acc;
  }, {} as Record<string, { sum: number, count: number }>);

  // 2. 2안(심층 진단) 영역별 달성률 (재무, 건강, 여가, 대인관계 중 어느 영역이 가장 취약한지 파악)
  // 각 영역의 획득 점수 합산 / 각 영역의 만점 합산
  const categoryStats = data.filter(d => d.planId === 'plan2' && d.answers).reduce((acc, curr) => {
    plans.plan2.questions.forEach(q => {
      if (!q.area) return;
      if (!acc[q.area]) acc[q.area] = { earned: 0, max: 0 };
      
      const earnedScore = curr.answers[q.id] || 0;
      acc[q.area].earned += (earnedScore / 5) * (q.weight || 1);
      acc[q.area].max += (q.weight || 1); // 5점 만점 기준 환산 전 가중치 최대치
    });
    return acc;
  }, {} as Record<string, { earned: number, max: number }>);

  const exportToExcel = () => {
    const headers = ['닉네임', '연령대', '진단 유형', '총점', '등급', '응답일시'];
    const rows = data.map(item => [
      item.name || '',
      item.ageGroup || '',
      item.planId === 'plan1' ? '1안' : '2안',
      item.score || 0,
      item.grade || '',
      item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : '-'
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `노후준비진단_결과_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">관리자 대시보드</h1>
          <div className="space-x-4">
            <button onClick={exportToExcel} className="text-green-600 font-bold hover:underline">엑셀 내보내기</button>
            <button onClick={() => fetchData()} className="text-blue-600 hover:underline">새로고침</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">데이터를 불러오는 중입니다...</div>
        ) : (
          <>
            {/* 상단 통계 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">총 참여자 수</h3>
                <p className="text-4xl font-black text-gray-800">{totalParticipants}명</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">1안(간편 진단) 평균 점수</h3>
                <p className="text-4xl font-black text-blue-600">
                  {planStats['plan1'] ? Math.round(planStats['plan1'].sum / planStats['plan1'].count) : 0}점
                </p>
                <p className="text-sm text-gray-400 mt-2">({planStats['plan1']?.count || 0}명 참여)</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-semibold mb-2">2안(심층 진단) 평균 점수</h3>
                <p className="text-4xl font-black text-indigo-600">
                  {planStats['plan2'] ? Math.round(planStats['plan2'].sum / planStats['plan2'].count) : 0}점
                </p>
                <p className="text-sm text-gray-400 mt-2">({planStats['plan2']?.count || 0}명 참여)</p>
              </div>
            </div>

            {/* 분포 차트 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 등급별 분포 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">등급별 분포</h3>
                <div className="space-y-4">
                  {['골든 시니어', '실버 로드', '옐로 라이트', '레드 라이트'].map(grade => {
                    const count = gradeCount[grade] || 0;
                    const percent = totalParticipants ? Math.round((count / totalParticipants) * 100) : 0;
                    return (
                      <div key={grade}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{grade}</span>
                          <span className="text-gray-500">{count}명 ({percent}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 연령대별 분포 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">연령대별 분포</h3>
                <div className="space-y-4">
                  {['39세 이하', '40~49세', '50~59세', '60~64세', '65세 이상'].map(age => {
                    const count = ageCount[age] || 0;
                    const percent = totalParticipants ? Math.round((count / totalParticipants) * 100) : 0;
                    return (
                      <div key={age}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{age}</span>
                          <span className="text-gray-500">{count}명 ({percent}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 연령대별 평균 점수 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">연령대별 평균 노후준비 점수</h3>
                <p className="text-sm text-gray-500 mb-6">어느 연령대가 가장 노후 준비에 취약한지 파악할 수 있습니다.</p>
                <div className="space-y-4">
                  {['39세 이하', '40~49세', '50~59세', '60~64세', '65세 이상'].map(age => {
                    const stat = ageScoreStats[age];
                    const avg = stat ? Math.round(stat.sum / stat.count) : 0;
                    return (
                      <div key={age}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{age}</span>
                          <span className="text-gray-500 font-bold">{avg}점</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${avg}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2안 심층 진단 - 영역별 준비도 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-2">영역별 평균 준비도 (심층 진단)</h3>
                <p className="text-sm text-gray-500 mb-6">시민들이 어떤 분야(재무/건강 등)에 가장 취약한지 보여줍니다.</p>
                <div className="space-y-4">
                  {['재무', '건강', '여가', '대인관계'].map(area => {
                    const stat = categoryStats[area];
                    const percent = stat && stat.max > 0 ? Math.round((stat.earned / stat.max) * 100) : 0;
                    return (
                      <div key={area}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{area} 영역</span>
                          <span className="text-gray-500 font-bold">{percent}% 준비됨</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 문항별 평균 점수 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6">문항별 평균 획득 점수</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-600 mb-4 pb-2 border-b">1안 (간편 진단)</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {qStats['plan1'] && Object.entries(qStats['plan1']).sort(([a], [b]) => Number(a) - Number(b)).map(([qId, stat]: [string, any]) => (
                      <div key={qId} className="flex justify-between">
                        <span>Q{qId}</span>
                        <span className="font-medium">{(stat.sum / stat.count).toFixed(2)}점</span>
                      </div>
                    ))}
                    {!qStats['plan1'] && <p className="text-gray-400">데이터 없음</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-600 mb-4 pb-2 border-b">2안 (심층 진단)</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {qStats['plan2'] && Object.entries(qStats['plan2']).sort(([a], [b]) => Number(a) - Number(b)).map(([qId, stat]: [string, any]) => (
                      <div key={qId} className="flex justify-between">
                        <span>Q{qId}</span>
                        <span className="font-medium">{(stat.sum / stat.count).toFixed(2)}점</span>
                      </div>
                    ))}
                    {!qStats['plan2'] && <p className="text-gray-400">데이터 없음</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* 원본 데이터 테이블 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <h3 className="text-lg font-bold text-gray-800 mb-6">최근 응답자 목록</h3>
              <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">닉네임</th>
                    <th className="px-6 py-3">연령대</th>
                    <th className="px-6 py-3">진단 유형</th>
                    <th className="px-6 py-3">총점</th>
                    <th className="px-6 py-3">등급</th>
                    <th className="px-6 py-3">응답일시</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4">{item.ageGroup}</td>
                      <td className="px-6 py-4">{item.planId === 'plan1' ? '1안' : '2안'}</td>
                      <td className="px-6 py-4">{item.score}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                          {item.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-400">응답 데이터가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
