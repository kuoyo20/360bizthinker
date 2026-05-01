import { useCallback, useState } from 'react'
import { ai, type AIDirection, type DirectionsResponse } from '@/lib/ai'
import { useAI } from '@/lib/useAI'
import { useStore } from '@/store/useStore'
import { INDUSTRY_TEMPLATES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { AIDirectionCard } from '@/components/AIDirectionCard'
import { AISuggestionsDialog, AITrigger } from '@/modules/M4_Journey/AISuggestionsDialog'

interface Props {
  roleId: string
}

export function AIPainTrigger({ roleId }: Props) {
  const role = useStore((s) => s.m3_empathy.roles.find((r) => r.id === roleId))
  const empathy = useStore((s) => s.m3_empathy.empathy_maps[roleId])
  const otherRoles = useStore((s) => s.m3_empathy.roles.filter((r) => r.id !== roleId))
  const industryTemplate = useStore((s) => s.m3_empathy.industry_template)
  const setText = useStore((s) => s.setM3EmpathyText)

  const [open, setOpen] = useState(false)

  const fetcher = useCallback(() => {
    if (!role || !empathy) {
      throw new Error('Role or empathy state missing')
    }
    const basicSummary = Object.entries(empathy.basic)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join(' / ') || '(基本資料尚未填寫)'

    const otherRolesSummary =
      otherRoles
        .map((r) => `- ${r.label}${r.is_keyman ? ' (KEYMAN)' : ''}`)
        .join('\n') || '(目前只有這 1 個角色)'

    return ai.painPoints({
      role_label: role.label,
      industry_label: INDUSTRY_TEMPLATES[industryTemplate].label,
      role_basic: basicSummary,
      role_think_feel: empathy.think_feel || '(學員尚未填寫內心想法)',
      other_roles: otherRolesSummary,
    })
  }, [role, empathy, otherRoles, industryTemplate])

  const { status, data, error, run, reset } = useAI<DirectionsResponse>(fetcher)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const apply = (d: AIDirection) => {
    if (!empathy) return
    const formatted = `【${d.label}】${d.summary}`
    const next = empathy.pain.trim() ? empathy.pain.trim() + '\n' + formatted : formatted
    setText(roleId, 'pain', next)
    setOpen(false)
  }

  if (!role) return null

  return (
    <>
      <AITrigger label="三個痛點建議" onClick={() => setOpen(true)} />
      <AISuggestionsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${role.label} · 三個痛點建議`}
        description="基於職位特性 + 其他角色差異化,3 個可被銷售方解決的痛點。選一個寫進「痛點」欄位。"
        status={status}
        error={error}
        onRun={run}
        skeletonCount={3}
      >
        {data && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.directions.map((d, i) => (
                <AIDirectionCard
                  key={i}
                  direction={d}
                  index={i}
                  onApply={apply}
                  applyLabel="寫進痛點"
                />
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-line-light">
              <span className="text-xs text-ink-muted">不滿意?重新生成。</span>
              <Button size="sm" variant="outline" onClick={run}>
                重新生成
              </Button>
            </div>
          </div>
        )}
      </AISuggestionsDialog>
    </>
  )
}
