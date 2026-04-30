import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DimensionKey, M4State, RootState, StageId } from '@/lib/types'
import { STORAGE_KEY } from '@/lib/constants'

const emptyStage = () => ({ target: '', questions: '', expected_output: '' })

const initialM4: M4State = {
  stages: {
    S1: emptyStage(),
    S2: emptyStage(),
    S3: emptyStage(),
    S4: emptyStage(),
    S5: emptyStage(),
    S6: emptyStage(),
  },
  emotion_peaks: {
    first_impression_60s: '',
    nps_peak: '',
    peak_end: '',
  },
}

interface StoreActions {
  setM4Field: (stage: StageId, dim: DimensionKey, value: string) => void
  setEmotionPeak: (key: keyof M4State['emotion_peaks'], value: string) => void
  reset: () => void
  getM4Completion: () => { filled: number; total: number }
  exportState: () => RootState
}

export type Store = RootState & StoreActions

const initialState: RootState = {
  meta: { lastSaved: null, userName: '' },
  m4_journey: initialM4,
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      setM4Field: (stage, dim, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: new Date().toISOString() },
          m4_journey: {
            ...state.m4_journey,
            stages: {
              ...state.m4_journey.stages,
              [stage]: { ...state.m4_journey.stages[stage], [dim]: value },
            },
          },
        })),

      setEmotionPeak: (key, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: new Date().toISOString() },
          m4_journey: {
            ...state.m4_journey,
            emotion_peaks: { ...state.m4_journey.emotion_peaks, [key]: value },
          },
        })),

      reset: () => set({ ...initialState }),

      getM4Completion: () => {
        const stages = get().m4_journey.stages
        const total = 12
        let filled = 0
        for (const id of ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] as StageId[]) {
          if (stages[id].questions.trim()) filled += 1
          if (stages[id].expected_output.trim()) filled += 1
        }
        return { filled, total }
      },

      exportState: () => {
        const { meta, m4_journey } = get()
        return { meta, m4_journey }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ meta: state.meta, m4_journey: state.m4_journey }),
    },
  ),
)
