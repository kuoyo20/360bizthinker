import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Attitude,
  DimensionKey,
  EmpathyBasic,
  EmpathyMap,
  IndustryTemplate,
  M3Analysis,
  M3State,
  M4State,
  OrgRole,
  RootState,
  StageId,
} from '@/lib/types'
import { INDUSTRY_TEMPLATES, STORAGE_KEY } from '@/lib/constants'

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

const emptyEmpathy = (): EmpathyMap => ({
  basic: {
    name: '',
    gender: '',
    age: '',
    position: '',
    work_content: '',
    location: '',
    family: '',
    income: '',
  },
  think_feel: '',
  hear: '',
  see: '',
  say_do: '',
  pain: '',
  gain: '',
})

const initialM3: M3State = {
  industry_template: 'custom',
  boss: { name: '', attitude: '' },
  roles: [],
  empathy_maps: {},
  analysis: { conflicts: '', excited_resistant: '', attack_path: '' },
}

type RoleLevel = 'manager' | 'senior' | 'junior'
type ContactField = 'name' | 'attitude'

interface StoreActions {
  setM4Field: (stage: StageId, dim: DimensionKey, value: string) => void
  setEmotionPeak: (key: keyof M4State['emotion_peaks'], value: string) => void

  // M3
  applyM3Template: (template: IndustryTemplate) => void
  setM3Boss: (field: 'name' | 'attitude', value: string) => void
  addM3Role: (role: OrgRole) => void
  removeM3Role: (roleId: string) => void
  setM3RoleLabel: (roleId: string, label: string) => void
  toggleM3Keyman: (roleId: string) => void
  setM3Contact: (
    roleId: string,
    level: RoleLevel,
    field: ContactField,
    value: string,
  ) => void
  setM3EmpathyBasic: (roleId: string, field: keyof EmpathyBasic, value: string) => void
  setM3EmpathyText: (
    roleId: string,
    field: 'think_feel' | 'hear' | 'see' | 'say_do' | 'pain' | 'gain',
    value: string,
  ) => void
  setM3Analysis: (analysis: M3Analysis) => void

  reset: () => void
  getM4Completion: () => { filled: number; total: number }
  getM3Completion: () => { filled: number; total: number }
  exportState: () => RootState
}

export type Store = RootState & StoreActions

const initialState: RootState = {
  meta: { lastSaved: null, userName: '' },
  m3_empathy: initialM3,
  m4_journey: initialM4,
}

const stamp = () => new Date().toISOString()

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ---------- M4 ----------
      setM4Field: (stage, dim, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
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
          meta: { ...state.meta, lastSaved: stamp() },
          m4_journey: {
            ...state.m4_journey,
            emotion_peaks: { ...state.m4_journey.emotion_peaks, [key]: value },
          },
        })),

      // ---------- M3 ----------
      applyM3Template: (template) =>
        set((state) => {
          const def = INDUSTRY_TEMPLATES[template]
          // clone to avoid mutating constant
          const roles: OrgRole[] = def.roles.map((r) => ({
            ...r,
            manager: { ...r.manager },
            senior: { ...r.senior },
            junior: { ...r.junior },
          }))
          const empathy_maps: Record<string, EmpathyMap> = {}
          for (const r of roles) empathy_maps[r.id] = state.m3_empathy.empathy_maps[r.id] ?? emptyEmpathy()

          return {
            meta: { ...state.meta, lastSaved: stamp() },
            m3_empathy: {
              ...state.m3_empathy,
              industry_template: template,
              roles,
              empathy_maps,
            },
          }
        }),

      setM3Boss: (field, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m3_empathy: {
            ...state.m3_empathy,
            boss: {
              ...state.m3_empathy.boss,
              [field]: field === 'attitude' ? (value as Attitude) : value,
            },
          },
        })),

      addM3Role: (role) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m3_empathy: {
            ...state.m3_empathy,
            roles: [...state.m3_empathy.roles, role],
            empathy_maps: { ...state.m3_empathy.empathy_maps, [role.id]: emptyEmpathy() },
          },
        })),

      removeM3Role: (roleId) =>
        set((state) => {
          const empathy_maps = { ...state.m3_empathy.empathy_maps }
          delete empathy_maps[roleId]
          return {
            meta: { ...state.meta, lastSaved: stamp() },
            m3_empathy: {
              ...state.m3_empathy,
              roles: state.m3_empathy.roles.filter((r) => r.id !== roleId),
              empathy_maps,
            },
          }
        }),

      setM3RoleLabel: (roleId, label) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m3_empathy: {
            ...state.m3_empathy,
            roles: state.m3_empathy.roles.map((r) =>
              r.id === roleId ? { ...r, label } : r,
            ),
          },
        })),

      toggleM3Keyman: (roleId) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m3_empathy: {
            ...state.m3_empathy,
            roles: state.m3_empathy.roles.map((r) =>
              r.id === roleId ? { ...r, is_keyman: !r.is_keyman } : r,
            ),
          },
        })),

      setM3Contact: (roleId, level, field, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m3_empathy: {
            ...state.m3_empathy,
            roles: state.m3_empathy.roles.map((r) => {
              if (r.id !== roleId) return r
              return {
                ...r,
                [level]: {
                  ...r[level],
                  [field]: field === 'attitude' ? (value as Attitude) : value,
                },
              }
            }),
          },
        })),

      setM3EmpathyBasic: (roleId, field, value) =>
        set((state) => {
          const current = state.m3_empathy.empathy_maps[roleId] ?? emptyEmpathy()
          return {
            meta: { ...state.meta, lastSaved: stamp() },
            m3_empathy: {
              ...state.m3_empathy,
              empathy_maps: {
                ...state.m3_empathy.empathy_maps,
                [roleId]: { ...current, basic: { ...current.basic, [field]: value } },
              },
            },
          }
        }),

      setM3EmpathyText: (roleId, field, value) =>
        set((state) => {
          const current = state.m3_empathy.empathy_maps[roleId] ?? emptyEmpathy()
          return {
            meta: { ...state.meta, lastSaved: stamp() },
            m3_empathy: {
              ...state.m3_empathy,
              empathy_maps: {
                ...state.m3_empathy.empathy_maps,
                [roleId]: { ...current, [field]: value },
              },
            },
          }
        }),

      setM3Analysis: (analysis) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m3_empathy: { ...state.m3_empathy, analysis },
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

      getM3Completion: () => {
        const m3 = get().m3_empathy
        const total = m3.roles.length || 1
        let filled = 0
        for (const role of m3.roles) {
          const e = m3.empathy_maps[role.id]
          if (!e) continue
          // count as "filled" if pain AND gain both have content
          if (e.pain.trim() && e.gain.trim()) filled += 1
        }
        return { filled, total }
      },

      exportState: () => {
        const { meta, m3_empathy, m4_journey } = get()
        return { meta, m3_empathy, m4_journey }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      partialize: (state) => ({
        meta: state.meta,
        m3_empathy: state.m3_empathy,
        m4_journey: state.m4_journey,
      }),
      migrate: (persistedState, fromVersion) => {
        // v1 → v2 added m3_empathy
        const state = persistedState as Partial<RootState>
        if (fromVersion < 2 && !state.m3_empathy) {
          return { ...state, m3_empathy: initialM3 } as RootState
        }
        return state as RootState
      },
    },
  ),
)
