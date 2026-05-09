// =============================================================
// Capability Evaluation Module — types + helpers + defaults
// 360 度雙向評分簡化版（W4 Phase 1：老闆視角單向打分）
// =============================================================

export type CompetencyGroup = "core" | "professional" | "leadership";

export interface Competency {
  id: string;
  label: string;
  group: CompetencyGroup;
}

export interface Department {
  id: string;
  name: string;
  parent_id: string | null;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  department_id: string | null;
  is_manager: boolean;
}

export interface CapabilityPayload {
  departments: Department[];
  employees: Employee[];
  competencies: Competency[];
  /** scores[employee_id][competency_id] = 1-5 */
  scores: Record<string, Record<string, number>>;
  settings: {
    cycle_name?: string;
  };
}

export const DEFAULT_COMPETENCIES: Competency[] = [
  // 核心職能（全員共同價值觀）
  { id: "core_integrity",      label: "誠信",     group: "core" },
  { id: "core_responsibility", label: "責任",     group: "core" },
  { id: "core_dedication",     label: "敬業",     group: "core" },
  { id: "core_learning",       label: "學習",     group: "core" },
  { id: "core_growth",         label: "成長",     group: "core" },
  // 專業能力（員工 + 經理都打）
  { id: "prof_expertise",      label: "專業知識", group: "professional" },
  { id: "prof_execution",      label: "執行力",   group: "professional" },
  { id: "prof_results",        label: "成果產出", group: "professional" },
  // 領導能力（只有經理打）
  { id: "lead_strategy",       label: "策略思維", group: "leadership" },
  { id: "lead_people",         label: "帶人帶心", group: "leadership" },
  { id: "lead_decision",       label: "決策魄力", group: "leadership" },
];

export const COMPETENCY_GROUP_LABEL: Record<CompetencyGroup, string> = {
  core:         "核心職能",
  professional: "專業能力",
  leadership:   "領導能力",
};

export function emptyPayload(): CapabilityPayload {
  return {
    departments: [],
    employees: [],
    competencies: DEFAULT_COMPETENCIES,
    scores: {},
    settings: {},
  };
}

// ── score helpers ──────────────────────────────────────────────

export function avgGroup(
  emp: Employee,
  payload: CapabilityPayload,
  group: CompetencyGroup,
): number {
  const empScores = payload.scores[emp.id] ?? {};
  const groupComps = payload.competencies.filter((c) => c.group === group);
  const scores = groupComps
    .map((c) => empScores[c.id])
    .filter((s): s is number => typeof s === "number" && s >= 1 && s <= 5);
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function employeeXY(
  emp: Employee,
  payload: CapabilityPayload,
): { x: number; y: number } {
  const prof = avgGroup(emp, payload, "professional");
  const lead = avgGroup(emp, payload, "leadership");
  const x = emp.is_manager && lead > 0 ? (prof + lead) / 2 : prof;
  const y = avgGroup(emp, payload, "core");
  return { x, y };
}

export type Bin = "low" | "mid" | "high";

export function bin(score: number): Bin {
  if (score < 2.5) return "low";
  if (score < 4) return "mid";
  return "high";
}

// 9-box label for (x bin, y bin)
export const NINEBOX_LABEL: Record<Bin, Record<Bin, string>> = {
  high: { high: "明日之星", mid: "高績效者", low: "績效需調整" },
  mid:  { high: "穩健核心", mid: "中堅力量", low: "風險員工" },
  low:  { high: "潛力新秀", mid: "成長中",   low: "需檢討去留" },
};

export function nineboxBucket(emp: Employee, payload: CapabilityPayload): {
  xb: Bin;
  yb: Bin;
  label: string;
  x: number;
  y: number;
} {
  const { x, y } = employeeXY(emp, payload);
  const xb = bin(x);
  const yb = bin(y);
  return { xb, yb, x, y, label: NINEBOX_LABEL[xb][yb] };
}

export function isFullyScored(emp: Employee, payload: CapabilityPayload): boolean {
  const empScores = payload.scores[emp.id] ?? {};
  const required = payload.competencies.filter(
    (c) => c.group !== "leadership" || emp.is_manager,
  );
  return required.every(
    (c) =>
      typeof empScores[c.id] === "number" &&
      empScores[c.id] >= 1 &&
      empScores[c.id] <= 5,
  );
}

// ── id generation (stable for runtime adds) ────────────────────

export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
