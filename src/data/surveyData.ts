import { SurveyPlan } from '../types';

// 1~5점 척도 공통 옵션 (1안용)
const scaleOptions = [
  { label: '전혀 아니다', score: 1 },
  { label: '아니다', score: 2 },
  { label: '보통이다', score: 3 },
  { label: '그렇다', score: 4 },
  { label: '매우 그렇다', score: 5 },
];

// 5/3/1점 가중치 공통 옵션 템플릿 (2안용)
const createOptions = (opt5: string, opt3: string, opt1: string) => [
  { label: opt5, score: 5 },
  { label: opt3, score: 3 },
  { label: opt1, score: 1 },
];

export const plans: Record<'plan1' | 'plan2', SurveyPlan> = {
  plan1: {
    id: 'plan1',
    title: '간편 노후준비 진단 (8문항)',
    questions: [
      { id: 1, text: '나는 노후에 필요한 월평균 생활비가 얼마인지 알고 있다.', options: scaleOptions, weight: 1 },
      { id: 2, text: '나는 은퇴 후 국민연금 외에 추가적인 소득원이 준비되어 있다.', options: scaleOptions, weight: 1 },
      { id: 3, text: '나는 규칙적인 운동과 식단 관리를 실천하고 있다.', options: scaleOptions, weight: 1 },
      { id: 4, text: '나는 만성질환 예방을 위한 정기적인 건강검진을 받고 있다.', options: scaleOptions, weight: 1 },
      { id: 5, text: '나는 퇴직 후에도 즐겁게 몰입할 수 있는 취미나 여가 활동이 있다.', options: scaleOptions, weight: 1 },
      { id: 6, text: '나는 내가 가진 기술이나 경험을 지역사회를 위해 나눌 의향이 있다.', options: scaleOptions, weight: 1 },
      { id: 7, text: '나는 고민을 털어놓고 의지할 수 있는 가족이나 친구 관계가 원만하다.', options: scaleOptions, weight: 1 },
      { id: 8, text: '나는 새로운 사람들과 교류하거나 지역사회 모임에 참여하는 데 거부감이 없다.', options: scaleOptions, weight: 1 },
    ],
  },
  plan2: {
    id: 'plan2',
    title: '영역별 심층 노후준비 진단 (가중치 적용)',
    questions: [
      // 재무 영역 (가중치 8, 총 40점)
      { id: 1, area: '재무', text: '귀하가 현재 가입 중인 연금은 무엇입니까?', options: createOptions('3종 이상', '1종만 보유', '없음'), weight: 8 },
      { id: 2, area: '재무', text: '퇴직 후 예상되는 월 총소득은 얼마입니까?', options: createOptions('250만원 이상', '150~250만원 미만', '150만원 미만'), weight: 8 },
      { id: 3, area: '재무', text: '은퇴 후 예상되는 월 필수 생활비를 가늠하고 있습니까?', options: createOptions('구체적 금액 파악', '대략적 파악', '전혀 못함'), weight: 8 },
      { id: 4, area: '재무', text: '비상시(질병, 사고 등) 즉시 사용할 수 있는 예비 자금이 있습니까?', options: createOptions('3개월분 이상', '1~2개월분', '거의 없음'), weight: 8 },
      { id: 5, area: '재무', text: '부채 상환 계획이 은퇴 전 완료될 예정입니까?', options: createOptions('은퇴 전 완납 예정', '일부 상환 필요', '계획 막막함'), weight: 8 },
      
      // 건강 영역 (가중치 10, 총 30점)
      { id: 6, area: '건강', text: '주 3회 이상, 30분 이상의 운동을 꾸준히 실천하십니까?', options: createOptions('매우 그렇다', '가끔 실천한다', '거의 하지 않는다'), weight: 10 },
      { id: 7, area: '건강', text: '최근 2년 내 국가 또는 개인 건강검진을 받으셨습니까?', options: createOptions('수검 완료', '계획 있음', '기록 없음'), weight: 10 },
      { id: 8, area: '건강', text: '노후 건강 유지를 위한 만성질환 관리 상태는 어떠합니까?', options: createOptions('질환 없음/완벽 관리', '주의 필요', '방치 중'), weight: 10 },
      
      // 여가 영역 (가중치 3.75, 총 15점)
      { id: 9, area: '여가', text: '은퇴 후 소득 창출을 위해 재취업이나 창업을 희망하십니까?', options: createOptions('희망', '생계형 희망', '희망하지 않음'), weight: 3.75 },
      { id: 10, area: '여가', text: '본인이 가진 전문 기술이나 경험을 나눌 의향이 있습니까?', options: createOptions('적극 참여 희망', '기회 시 참여', '관심 없음'), weight: 3.75 },
      { id: 11, area: '여가', text: '하루 3시간 이상 몰입할 수 있는 취미가 있습니까?', options: createOptions('명확히 있다', '찾는 중이다', '없음'), weight: 3.75 },
      { id: 12, area: '여가', text: '춘천시 내 평생학습 정보나 시니어 아카데미를 알고 계십니까?', options: createOptions('참여 중', '정보 필요', '전혀 모름'), weight: 3.75 },
      
      // 대인관계 영역 (가중치 5, 총 15점)
      { id: 13, area: '대인관계', text: '고민을 나눌 수 있는 배우자나 친구가 있습니까?', options: createOptions('충분히 있다', '1~2명 정도 있다', '거의 없다'), weight: 5 },
      { id: 14, area: '대인관계', text: '사람 만나는 것에 대한 현재의 감정은 어떠십니까?', options: createOptions('매우 즐겁다', '보통이다', '부담스럽다'), weight: 5 },
      { id: 15, area: '대인관계', text: '현재 또는 은퇴 후 삶에 대한 기대감이 불안감보다 큽니까?', options: createOptions('설레고 기대된다', '걱정과 기대 반반', '매우 불안하다'), weight: 5 },
    ],
  },
};