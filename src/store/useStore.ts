import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Attitude,
  DimensionKey,
  EmpathyBasic,
  EmpathyMap,
  IndustryTemplate,
  M1CellKey,
  M1ListKey,
  M1State,
  M2FieldKey,
  M2State,
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

const emptyCell = () => ({ existing: '', opportunity: '' })

const initialM1: M1State = {
  career_downstream: emptyCell(),
  career_upstream: emptyCell(),
  career_adjacent: emptyCell(),
  edu_school: emptyCell(),
  edu_club: emptyCell(),
  edu_training: emptyCell(),
  most_contacted_5: '',
  go_to_help_5: '',
  role_models: '',
}

const initialM2: M2State = {
  market_target: '',
  vision_emotion: '',
  product_rational: '',
  qc_quantify: '',
  qc_celebrity: '',
  positioning_statement: '',
}

type RoleLevel = 'manager' | 'senior' | 'junior'
type ContactField = 'name' | 'attitude'

interface StoreActions {
  // M1
  setM1Cell: (cell: M1CellKey, side: 'existing' | 'opportunity', value: string) => void
  setM1List: (list: M1ListKey, value: string) => void

  // M2
  setM2Field: (field: M2FieldKey, value: string) => void

  // M4
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
  getM1Completion: () => { filled: number; total: number }
  getM2Completion: () => { filled: number; total: number }
  getM3Completion: () => { filled: number; total: number }
  getM4Completion: () => { filled: number; total: number }
  exportState: () => RootState
}

export type Store = RootState & StoreActions

const initialState: RootState = {
  meta: { lastSaved: null, userName: '' },
  m1_network: initialM1,
  m2_mvp: initialM2,
  m3_empathy: initialM3,
  m4_journey: initialM4,
}

const stamp = () => new Date().toISOString()

const M1_CELL_KEYS: M1CellKey[] = [
  'career_downstream',
  'career_upstream',
  'career_adjacent',
  'edu_school',
  'edu_club',
  'edu_training',
]

const M2_REQUIRED_FIELDS: M2FieldKey[] = [
  'market_target',
  'vision_emotion',
  'product_rational',
  'qc_quantify',
  'positioning_statement',
]

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ---------- M1 ----------
      setM1Cell: (cell, side, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m1_network: {
            ...state.m1_network,
            [cell]: { ...state.m1_network[cell], [side]: value },
          },
        })),

      setM1List: (list, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m1_network: { ...state.m1_network, [list]: value },
        })),

      // ---------- M2 ----------
      setM2Field: (field, value) =>
        set((state) => ({
          meta: { ...state.meta, lastSaved: stamp() },
          m2_mvp: { ...state.m2_mvp, [field]: value },
        })),

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

      // ---------- Completion ----------
      getM1Completion: () => {
        const m1 = get().m1_network
        const total = 9 // 6 cells + 3 lists
        let filled = 0
        for (const k of M1_CELL_KEYS) {
          if (m1[k].existing.trim() || m1[k].opportunity.trim()) filled += 1
        }
        if (m1.most_contacted_5.trim()) filled += 1
        if (m1.go_to_help_5.trim()) filled += 1
        if (m1.role_models.trim()) filled += 1
        return { filled, total }
      },

      getM2Completion: () => {
        const m2 = get().m2_mvp
        const total = M2_REQUIRED_FIELDS.length
        let filled = 0
        for (const f of M2_REQUIRED_FIELDS) {
          if (m2[f].trim()) filled += 1
        }
        return { filled, total }
      },

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
          if (e.pain.trim() && e.gain.trim()) filled += 1
        }
        return { filled, total }
      },

      exportState: () => {
        const { meta, m1_network, m2_mvp, m3_empathy, m4_journey } = get()
        return { meta, m1_network, m2_mvp, m3_empathy, m4_journey }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      partialize: (state) => ({
        meta: state.meta,
        m1_network: state.m1_network,
        m2_mvp: state.m2_mvp,
        m3_empathy: state.m3_empathy,
        m4_journey: state.m4_journey,
      }),
      migrate: (persistedState, fromVersion) => {
        const state = (persistedState ?? {}) as Partial<RootState>
        const next: Partial<RootState> = { ...state }
        if (fromVersion < 2 && !next.m3_empathy) next.m3_empathy = initialM3
        if (fromVersion < 3) {
          if (!next.m1_network) next.m1_network = initialM1
          if (!next.m2_mvp) next.m2_mvp = initialM2
        }
        return next as RootState
      },
    },
  ),
)
