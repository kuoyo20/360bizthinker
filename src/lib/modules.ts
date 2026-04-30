import { Users, Target, HeartHandshake, Map, type LucideIcon } from 'lucide-react'

export interface ModuleDef {
  id: 'm1' | 'm2' | 'm3' | 'm4'
  number: '①' | '②' | '③' | '④'
  label: string
  description: string
  path: string
  icon: LucideIcon
  enabled: boolean
}

export const MODULES: ModuleDef[] = [
  {
    id: 'm1',
    number: '①',
    label: '人脈三歷',
    description: '經歷 / 學歷 / 閱歷 3×3 矩陣',
    path: '/m1',
    icon: Users,
    enabled: false,
  },
  {
    id: 'm2',
    number: '②',
    label: 'M.V.P 價值主張',
    description: 'Market / Vision / Product',
    path: '/m2',
    icon: Target,
    enabled: false,
  },
  {
    id: 'm3',
    number: '③',
    label: '多角色同理心地圖',
    description: 'KEYMAN 組織 + 各角色同理心',
    path: '/m3',
    icon: HeartHandshake,
    enabled: false,
  },
  {
    id: 'm4',
    number: '④',
    label: '6×5 客戶旅程地圖',
    description: '一頁攻擊計劃',
    path: '/m4',
    icon: Map,
    enabled: true,
  },
]
