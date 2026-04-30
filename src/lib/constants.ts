import type { StageId } from './types'

export const STAGE_BEHAVIORS: Record<StageId, string[]> = {
  S1: ['蒐集資料', '市場研究', '蒐集潛在名單', '擬定策略', '電話開發', '業績估算', '申請樣品'],
  S2: ['當面拜訪'],
  S3: ['了解需求', '分析需求', '找到痛點', '問題回饋', '現場討論', '內部討論'],
  S4: ['產品介紹', '客製化方案'],
  S5: ['1st 報價', '2nd 報價', '議價'],
  S6: ['簽訂合約', '產品提供', '後續售後'],
}

export const EMOTION_PEAK_STAGES: Record<'p1' | 'p2' | 'p3', { stage: StageId; label: string; sublabel: string }> = {
  p1: { stage: 'S2', label: '60 秒第一印象', sublabel: '第一印象' },
  p2: { stage: 'S4', label: 'N.P.S 創造高峰', sublabel: '創造高峰' },
  p3: { stage: 'S6', label: '峰終留念', sublabel: '留在最好的一刻' },
}

export const STORAGE_KEY = 'sales_strategist_data'
