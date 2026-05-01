import { useCallback, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { ai, type ConflictAnalysisResponse } from '@/lib/ai'
import { useAI } from '@/lib/useAI'
import { useStore } from '@/store/useStore'
import { INDUSTRY_TEMPLATES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { AISuggestionsDialog } from '@/modules/M4_Journey/AISuggestionsDialog'

export function AIConflictTrigger() {
  const roles = useStore((s) => s.m3_empathy.roles)
  const empathyMaps = useStore((s) => s.m3_empathy.empathy_maps)
  const industry = useStore((s) => s.m3_empathy.industry_template)
  const setAnalysis = useStore((s) => s.setM3Analysis)

  const [open, setOpen] = useState(false)

  const filledRoles = roles.filter((r) => {
    const e = empathyMaps[r.id]
    return e && e.pain.trim() && e.gain.trim()
  })

  const fetcher = useCallback(() => {
    const rolesSummary = filledRoles
      .map((r) => {
        const e = empathyMaps[r.id]
        return `[${r.label}${r.is_keyman ? ' KEYMAN' : ''}]
  痛點:${e.pain}
  爽點:${e.gain}`
      })
      .join('\n\n')

    return ai.conflictAnalysis({
      industry_label: INDUSTRY_TEMPLATES[industry].label,
      roles_summary: rolesSummary,
      m2_mvp_summary: '(M2 模組尚未開放,提案內容待 Phase 4 補)',
    })
  }, [filledRoles, empathyMaps, industry])

  const { status, data, error, run, reset } = useAI<ConflictAnalysisResponse>(fetcher)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const apply = () => {
    if (!data) return
    setAnalysis(data)
    setOpen(false)
  }

  const tooFew = filledRoles.length < 2

  return (
    <>
      <Button
        variant="gold"
        onClick={() => setOpen(true)}
        disabled={tooFew}
        className="gap-2"
        title={tooFew ? '至少 2 個角色填完痛點 + 爽點才能分析' : ''}
      >
        <Sparkles className="size-4" />
        角色衝突 + 攻擊路徑分析
        {!tooFew && (
          <span className="font-mono text-xs opacity-80">({filledRoles.length} 角色)</span>
        )}
      </Button>

      <AISuggestionsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="角色衝突 + 攻擊路徑分析"
        description={`分析 ${filledRoles.length} 個已填角色之間的利益衝突、誰興奮 / 誰抗拒、攻擊順序。`}
        status={status}
        error={error}
        onRun={run}
        skeletonCount={3}
      >
        {data && (
          <div className="space-y-3">
            <Section title="角色間利益衝突" body={data.conflicts} accent="red" />
            <Section title="誰最興奮 / 誰最抗拒" body={data.excited_resistant} accent="gold" />
            <Section title="攻擊路徑建議" body={data.attack_path} accent="green" />

            <div className="flex justify-between items-center pt-3 border-t border-line-light">
              <span className="text-xs text-ink-muted">套用會儲存到 M3 分析區。</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={run}>
                  重新分析
                </Button>
                <Button size="sm" variant="default" onClick={apply}>
                  套用結果
                </Button>
              </div>
            </div>
          </div>
        )}
      </AISuggestionsDialog>
    </>
  )
}

interface SectionProps {
  title: string
  body: string
  accent: 'red' | 'gold' | 'green'
}

function Section({ title, body, accent }: SectionProps) {
  const palette = {
    red: 'border-accent-red/30 bg-accent-red/5 text-accent-red',
    gold: 'border-accent-gold/30 bg-accent-gold/5 text-accent-gold',
    green: 'border-accent-green/30 bg-accent-green/5 text-accent-green',
  }[accent]
  return (
    <article className={`rounded-md border ${palette} p-3`}>
      <h4 className={`font-serif font-bold text-sm mb-1`}>{title}</h4>
      <p className="text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">{body}</p>
    </article>
  )
}
