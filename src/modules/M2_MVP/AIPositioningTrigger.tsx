import { useCallback, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { ai, type PositioningResponse } from '@/lib/ai'
import { useAI } from '@/lib/useAI'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { AISuggestionsDialog } from '@/modules/M4_Journey/AISuggestionsDialog'

const VERSION_LABELS = ['短版本', '中版本', '長版本']

export function AIPositioningTrigger() {
  const m2 = useStore((s) => s.m2_mvp)
  const setField = useStore((s) => s.setM2Field)

  const [open, setOpen] = useState(false)

  const fetcher = useCallback(
    () =>
      ai.positioning({
        market_target: m2.market_target || '(尚未填寫)',
        vision_emotion: m2.vision_emotion || '(尚未填寫)',
        product_rational: m2.product_rational || '(尚未填寫)',
      }),
    [m2.market_target, m2.vision_emotion, m2.product_rational],
  )
  const { status, data, error, run, reset } = useAI<PositioningResponse>(fetcher)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const apply = (sentence: string) => {
    setField('positioning_statement', sentence)
    setOpen(false)
  }

  const tooEmpty = !m2.market_target.trim() && !m2.vision_emotion.trim() && !m2.product_rational.trim()

  return (
    <>
      <Button
        variant="gold"
        onClick={() => setOpen(true)}
        disabled={tooEmpty}
        className="gap-2"
        title={tooEmpty ? 'M / V / P 至少填一個' : ''}
      >
        <Sparkles className="size-4" />
        生成定位句
      </Button>

      <AISuggestionsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="生成定位句 · 3 個版本"
        description="句型:「對於 ___ 來說,與 ___ 相比,我們更 ___、___、___」。短 / 中 / 長 各一版,選一個套用。"
        status={status}
        error={error}
        onRun={run}
        skeletonCount={3}
      >
        {data && (
          <div className="space-y-3">
            {data.versions.map((v, i) => (
              <article
                key={i}
                className="rounded-md border border-line-light bg-paper-card p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-accent-gold">
                    {VERSION_LABELS[i] ?? `v${i + 1}`}
                  </span>
                  <span className="text-[10px] text-ink-muted font-mono">
                    {v.length} 字
                  </span>
                </div>
                <p className="text-sm text-ink-primary leading-relaxed">{v}</p>
                <div className="flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => apply(v)}>
                    用這個
                  </Button>
                </div>
              </article>
            ))}
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
