// =============================================================
// 360 戰略模組 — types + helpers
// Phase 1 simplified: 願景 + PESTEL 環境 + 一頁戰略書
// =============================================================

export type ImpactLevel = "low" | "medium" | "high";

export interface PestelEntry {
  factor: string;
  impact: ImpactLevel;
}

export interface StrategyPayload {
  vision: {
    ten_year_scene: string;
    core_capabilities: string;
    problem_solved: string;
    impact_target: string;
  };
  environment: {
    pestel: {
      political: PestelEntry;
      economic: PestelEntry;
      social: PestelEntry;
      technological: PestelEntry;
      environmental: PestelEntry;
      legal: PestelEntry;
    };
    market: {
      tam_billion_ntd: number | null;
      sam_billion_ntd: number | null;
      som_billion_ntd: number | null;
      notes: string;
    };
  };
  one_pager: {
    where_we_are: string;
    where_to_go: string;
    how_to_get_there: string;
    what_to_avoid: string;
    first_30_days: string;
  };
  cross_module_refs?: {
    used: string[]; // module_types referenced when AI drafted
    snapshot_at: string;
  };
}

export const PESTEL_KEYS = [
  "political",
  "economic",
  "social",
  "technological",
  "environmental",
  "legal",
] as const;

export type PestelKey = (typeof PESTEL_KEYS)[number];

export const PESTEL_LABEL: Record<PestelKey, string> = {
  political:     "政治 (P)",
  economic:      "經濟 (E)",
  social:        "社會 (S)",
  technological: "科技 (T)",
  environmental: "環境 (E)",
  legal:         "法律 (L)",
};

export const IMPACT_LABEL: Record<ImpactLevel, string> = {
  low: "低", medium: "中", high: "高",
};

export const MODULE_LABEL: Record<string, string> = {
  assessment:      "影響力密碼",
  capability_eval: "能力評分",
  contact_network: "人脈管理",
  sales_pipeline:  "銷售大師",
  brand_os:        "品牌大師",
  strategy:        "360 戰略",
};

export function emptyStrategyPayload(): StrategyPayload {
  return {
    vision: {
      ten_year_scene: "",
      core_capabilities: "",
      problem_solved: "",
      impact_target: "",
    },
    environment: {
      pestel: {
        political:     { factor: "", impact: "medium" },
        economic:      { factor: "", impact: "medium" },
        social:        { factor: "", impact: "medium" },
        technological: { factor: "", impact: "medium" },
        environmental: { factor: "", impact: "medium" },
        legal:         { factor: "", impact: "medium" },
      },
      market: {
        tam_billion_ntd: null,
        sam_billion_ntd: null,
        som_billion_ntd: null,
        notes: "",
      },
    },
    one_pager: {
      where_we_are: "",
      where_to_go: "",
      how_to_get_there: "",
      what_to_avoid: "",
      first_30_days: "",
    },
  };
}

export function visionFilled(p: StrategyPayload): boolean {
  return (
    !!p.vision.ten_year_scene.trim() ||
    !!p.vision.core_capabilities.trim() ||
    !!p.vision.problem_solved.trim()
  );
}

export function environmentFilled(p: StrategyPayload): boolean {
  return PESTEL_KEYS.some((k) => p.environment.pestel[k].factor.trim());
}

export function onePagerFilled(p: StrategyPayload): boolean {
  return !!(
    p.one_pager.where_we_are.trim() ||
    p.one_pager.where_to_go.trim() ||
    p.one_pager.how_to_get_there.trim()
  );
}
