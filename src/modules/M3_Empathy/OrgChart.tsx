import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { M3_ATTITUDE_OPTIONS } from '@/lib/constants'
import type { Attitude } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { RoleCard } from './RoleCard'

interface Props {
  onOpenEmpathy: (roleId: string) => void
}

export function OrgChart({ onOpenEmpathy }: Props) {
  const boss = useStore((s) => s.m3_empathy.boss)
  const roles = useStore((s) => s.m3_empathy.roles)
  const setBoss = useStore((s) => s.setM3Boss)
  const addRole = useStore((s) => s.addM3Role)

  const [newRoleLabel, setNewRoleLabel] = useState('')

  const handleAddRole = () => {
    const label = newRoleLabel.trim()
    if (!label) return
    const id = `custom_${Date.now()}`
    addRole({
      id,
      label,
      is_keyman: false,
      manager: { name: '', attitude: '' },
      senior: { name: '', attitude: '' },
      junior: { name: '', attitude: '' },
    })
    setNewRoleLabel('')
  }

  return (
    <div className="space-y-6">
      {/* Boss */}
      <div className="flex justify-center">
        <div className="rounded-lg border-2 border-accent-gold bg-accent-gold/10 px-5 py-3 min-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] text-accent-gold">A. 老闆</span>
            <span className="ml-auto text-[10px] font-mono bg-accent-gold text-white px-1.5 rounded">
              KEYMAN
            </span>
          </div>
          <input
            type="text"
            value={boss.name}
            onChange={(e) => setBoss('name', e.target.value)}
            placeholder="老闆姓名"
            className="w-full font-serif font-bold text-base text-ink-primary bg-transparent border-b border-line-light focus:border-accent-gold focus:outline-none mb-2"
          />
          <select
            value={boss.attitude}
            onChange={(e) => setBoss('attitude', e.target.value as Attitude)}
            className="w-full text-xs font-mono bg-transparent border border-line-light rounded px-2 py-1 focus:outline-none"
          >
            {M3_ATTITUDE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Connector visual */}
      <div className="flex justify-center -my-2">
        <div className="w-px h-6 bg-line-medium" />
      </div>

      {/* Roles */}
      {roles.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-line-medium bg-paper-card/50 p-8 text-center">
          <p className="text-ink-secondary text-sm">
            還沒有角色 — 上方選一個產業模板帶入,或下方手動加。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => (
            <RoleCard key={r.id} role={r} onOpenEmpathy={onOpenEmpathy} />
          ))}
        </div>
      )}

      {/* Add custom role */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={newRoleLabel}
          onChange={(e) => setNewRoleLabel(e.target.value)}
          placeholder="加自訂角色(例:財務 / 法務 / IT)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddRole()
          }}
          className="flex-1 max-w-xs text-sm border border-line-medium rounded px-3 py-2 focus:outline-none focus:border-brand"
        />
        <Button size="sm" variant="outline" onClick={handleAddRole} className="gap-1.5">
          <Plus className="size-4" />
          新增角色
        </Button>
      </div>
    </div>
  )
}
