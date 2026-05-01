import { useCallback, useState } from 'react'
import { ai, type AIDirection, type DirectionsResponse } from '@/lib/ai'
import { useAI } from '@/lib/useAI'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { AIDirectionCard } from '@/components/AIDirectionCard'
import { AISuggestionsDialog, AITrigger } from '@/modules/M4_Journey/AISuggestionsDialog'

export function AIVisionTrigger() {
  const market = useStore((s) => s.m2_mvp.market_target)
  const current = useStore((s) => s.m2_mvp.vision_emotion)
  const setField = useStore((s) => s.setM2Field)

  const [open, setOpen] = useState(false)

  const fetcher = useCallback(
    () => ai.vision({ market_target: market || '(尚未填寫目標市場)' }),
    [market],
  )
  const { status, data, error, run, reset } = useAI<DirectionsResponse>(fetcher)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const apply = (d: AIDirection) => {
    const formatted = `【${d.label}】${d.summary}`
    const next = current.trim() ? current.trim() + '\n' + formatted : formatted
    setField('vision_emotion', next)
    setOpen(false)
  }

  return (
    <>
      <AITrigger label="三個感性方向" onClick={() => setOpen(true)} />
      <AISuggestionsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="V · 三個感性溝通方向"
        description="基於你的目標市場,3 個讓客戶內心被觸動的情感方向。"
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
                  applyLabel="寫進 V"
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
