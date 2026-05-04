export const ASSESSMENT_SECTIONS = [
  { key: "strategy", label: "策略力", short: "STR" },
  { key: "brand",    label: "品牌力", short: "BRD" },
  { key: "ops",      label: "營運力", short: "OPS" },
  { key: "sales",    label: "銷售力", short: "SAL" },
  { key: "mgmt",     label: "管理力", short: "MGT" },
] as const;

export type AssessmentSection = (typeof ASSESSMENT_SECTIONS)[number]["key"];

export const SECTION_LABEL: Record<AssessmentSection, string> = {
  strategy: "策略力",
  brand: "品牌力",
  ops: "營運力",
  sales: "銷售力",
  mgmt: "管理力",
};

export interface AssessmentQuestion {
  id: string;
  section: AssessmentSection;
  text: string;
  display_order: number;
}

export interface AssessmentAnswer {
  question_id: string;
  score: number; // 1-5
  comment?: string;
}

export interface AssessmentChallenge {
  key: string;
  display_text: string;
  display_order: number;
}

export interface RankedChallenge {
  key: string;
  rank: number;
  display_text: string;
}

export interface AssessmentPayload {
  answers: AssessmentAnswer[];
  scores: Record<AssessmentSection, number>;
  challenges_ranked: RankedChallenge[];
  observations: string[];
  completed_at?: string;
}

export const draftKey = (companyId: string) => `assessment-draft:${companyId}`;

export const SCORE_LABELS = ["", "完全不符合", "不太符合", "中等", "大部分符合", "非常符合"];
