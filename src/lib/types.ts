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

export interface RootState {
  meta: AppMeta
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
