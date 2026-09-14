export type PlanType = 'plan1' | 'plan2';

export interface Option {
  label: string;
  score: number; // 5, 3, 1 (또는 1~5점)
}

export interface Question {
  id: number;
  area?: string; // 재무, 건강 등 (2안용)
  text: string;
  options: Option[];
  weight: number; // 1안은 1, 2안은 영역별 가중치(8, 10, 3.75, 5)
}

export interface SurveyPlan {
  id: PlanType;
  title: string;
  questions: Question[];
}