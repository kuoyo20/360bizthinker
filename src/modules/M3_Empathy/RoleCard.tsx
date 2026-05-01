import { Crown, Trash2, ArrowRight } from 'lucide-react'
import { M3_ATTITUDE_OPTIONS } from '@/lib/constants'
import type { Attitude, OrgRole } from '@/lib/types'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  role: OrgRole
  onOpenEmpathy: (roleId: string) => void
}

const LEVELS: Array<{ key: 'manager' | 'senior' | 'junior'; label: string }> = [
  { key: 'manager', label: 'MANAGER' },
  { key: 'senior', label: 'SENIOR' },
  { key: 'junior', label: 'JUNIOR' },
]

export function RoleCard({ role, onOpenEmpathy }: Props) {
  const setLabel = useStore((s) => s.setM3RoleLabel)
  const toggleKeyman = useStore((s) => s.toggleM3Keyman)
  const setContact = useStore((s) => s.setM3Contact)
  const removeRole = useStore((s) => s.removeM3Role)
  const empathy = useStore((s) => s.m3_empathy.empathy_maps[role.id])

  const filled = !!(empathy?.pain.trim() && empathy?.gain.trim())

  return (
    <div
      className={cn(
        'rounded-lg border bg-paper-card overflow-hidden transition-colors',
        role.is_keyman ? 'border-accent-gold' : 'border-line-light',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 border-b border-line-light',
          role.is_keyman ? 'bg-accent-gold/10' : 'bg-paper',
        )}
      >
        <input
          type="text"
          value={role.label}
          onChange={(e) => setLabel(role.id, e.target.value)}
          className="flex-1 bg-transparent font-serif font-bold text-sm text-ink-primary focus:outline-none focus:underline"
          placeholder="角色名稱"
        />

        <button
          type="button"
          onClick={() => toggleKeyman(role.id)}
          className={cn(
            'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono transition-colors',
            role.is_keyman
              ? 'bg-accent-gold text-white'
              : 'bg-line-light text-ink-muted hover:bg-accent-gold/20',
          )}
          title="切換 KEYMAN"
        >
          <Crown className="size-3" />
          KEYMAN
        </button>

        <button
          type="button"
          onClick={() => {
            if (window.confirm(`刪除「${role.label}」角色?同理心地圖也會一併清除。`)) {
              removeRole(role.id)
            }
          }}
          className="text-ink-muted hover:text-accent-red"
          title="刪除角色"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {/* Levels */}
      <div className="divide-y divide-line-light">
        {LEVELS.map((lvl) => {
          const contact = role[lvl.key]
          return (
            <div key={lvl.key} className="grid grid-cols-[60px_1fr_80px] gap-1 px-3 py-1.5 items-center">
              <span className="font-mono text-[10px] text-ink-muted">{lvl.label}</span>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => setContact(role.id, lvl.key, 'name', e.target.value)}
                placeholder="姓名"
                className="text-xs bg-transparent border border-transparent focus:border-line-medium rounded px-1 py-0.5 focus:outline-none"
              />
              <select
                value={contact.attitude}
                onChange={(e) => setContact(role.id, lvl.key, 'attitude', e.target.value as Attitude)}
                className="text-xs font-mono bg-transparent border border-transparent focus:border-line-medium rounded px-1 py-0.5 focus:outline-none"
              >
                {M3_ATTITUDE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      {/* Footer / open empathy */}
      <div className="border-t border-line-light p-2 flex items-center justify-between bg-paper">
        <span className={cn('text-xs', filled ? 'text-accent-green' : 'text-ink-muted')}>
          {filled ? '✓ 同理心地圖已填' : '同理心地圖未填'}
        </span>
        <Button size="sm" variant="outline" onClick={() => onOpenEmpathy(role.id)} className="gap-1 h-7">
          填寫
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  )
}
