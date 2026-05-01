export type StageId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6'

export type DimensionKey = 'target' | 'questions' | 'expected_output'

export interface StageMeta {
  id: StageId
  label: string
  shortLabel: string
}

export interface JourneyStage {
  target: string
  questions: string
  expected_output: string
}

export interface EmotionPeaks {
  first_impression_60s: string
  nps_peak: string
  peak_end: string
}

export interface M4State {
  stages: Record<StageId, JourneyStage>
  emotion_peaks: EmotionPeaks
}

export interface AppMeta {
  lastSaved: string | null
  userName: string
}

export type Attitude = '++' | '+' | '-' | ''

export type IndustryTemplate = 'restaurant' | 'beverage_chain' | 'manufacturing' | 'custom'

export interface AttitudePerson {
  name: string
  attitude: Attitude
}

export interface OrgRole {
  id: string
  label: string
  is_keyman: boolean
  manager: AttitudePerson
  senior: AttitudePerson
  junior: AttitudePerson
}

export interface OrgBoss {
  name: string
  attitude: Attitude
}

export interface EmpathyBasic {
  name: string
  gender: string
  age: string
  position: string
  work_content: string
  location: string
  family: string
  income: string
}

export interface EmpathyMap {
  basic: EmpathyBasic
  think_feel: string
  hear: string
  see: string
  say_do: string
  pain: string
  gain: string
}

export interface M3Analysis {
  conflicts: string
  excited_resistant: string
  attack_path: string
}

export interface M3State {
  industry_template: IndustryTemplate
  boss: OrgBoss
  roles: OrgRole[]
  empathy_maps: Record<string, EmpathyMap>
  analysis: M3Analysis
}

// ---------------- M1 人脈三歷 ----------------

export interface M1Cell {
  existing: string
  opportunity: string
}

export interface M1State {
  career_downstream: M1Cell
  career_upstream: M1Cell
  career_adjacent: M1Cell
  edu_school: M1Cell
  edu_club: M1Cell
  edu_training: M1Cell
  most_contacted_5: string
  go_to_help_5: string
  role_models: string
}

export type M1CellKey =
  | 'career_downstream'
  | 'career_upstream'
  | 'career_adjacent'
  | 'edu_school'
  | 'edu_club'
  | 'edu_training'

export type M1ListKey = 'most_contacted_5' | 'go_to_help_5' | 'role_models'

// ---------------- M2 M.V.P ----------------

export interface M2State {
  market_target: string
  vision_emotion: string
  product_rational: string
  qc_quantify: string
  qc_celebrity: string
  positioning_statement: string
}

export type M2FieldKey = keyof M2State

export interface RootState {
  meta: AppMeta
  m1_network: M1State
  m2_mvp: M2State
  m3_empathy: M3State
  m4_journey: M4State
}

export const STAGES: StageMeta[] = [
  { id: 'S1', label: '開發 / 準備', shortLabel: '開發準備' },
  { id: 'S2', label: '拜訪', shortLabel: '拜訪' },
  { id: 'S3', label: '了解需求', shortLabel: '了解需求' },
  { id: 'S4', label: '提案', shortLabel: '提案' },
  { id: 'S5', label: '議價', shortLabel: '議價' },
  { id: 'S6', label: '成交', shortLabel: '成交' },
]
