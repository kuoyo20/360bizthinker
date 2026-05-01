import { useCallback, useState } from 'react'
import { ai, type AIDirection, type DirectionsResponse } from '@/lib/ai'
import { useAI } from '@/lib/useAI'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { AIDirectionCard } from '@/components/AIDirectionCard'
import { AISuggestionsDialog, AITrigger } from '@/modules/M4_Journey/AISuggestionsDialog'

export function AIProductTrigger() {
  const market = useStore((s) => s.m2_mvp.market_target)
  const vision = useStore((s) => s.m2_mvp.vision_emotion)
  const current = useStore((s) => s.m2_mvp.product_rational)
  const setField = useStore((s) => s.setM2Field)

  const [open, setOpen] = useState(false)

  const fetcher = useCallback(
    () =>
      ai.product({
        market_target: market || '(尚未填寫)',
        vision_emotion: vision || '(尚未填寫)',
      }),
    [market, vision],
  )
  const { status, data, error, run, reset } = useAI<DirectionsResponse>(fetcher)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const apply = (d: AIDirection) => {
    const formatted = `【${d.label}】${d.summary}\n→ 證明方式:${d.next_step}`
    const next = current.trim() ? current.trim() + '\n\n' + formatted : formatted
    setField('product_rational', next)
    setOpen(false)
  }

  return (
    <>
      <AITrigger label="三個理性方向" onClick={() => setOpen(true)} />
      <AISuggestionsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="P · 三個理性差異方向"
        description="基於市場 + 感性,3 個可量化、客戶必選你的具體差異。呼應 Q.C 框架。"
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
                  applyLabel="寫進 P"
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
