import { useCallback, useState } from 'react'
import { ai, type AIDirection, type DirectionsResponse } from '@/lib/ai'
import { useAI } from '@/lib/useAI'
import { useStore } from '@/store/useStore'
import type { M1CellKey } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { AIDirectionCard } from '@/components/AIDirectionCard'
import { AISuggestionsDialog, AITrigger } from '@/modules/M4_Journey/AISuggestionsDialog'

interface Props {
  cellKey: M1CellKey
  cellLabel: string
}

export function AINetworkTrigger({ cellKey, cellLabel }: Props) {
  const cell = useStore((s) => s.m1_network[cellKey])
  const setCell = useStore((s) => s.setM1Cell)

  const [open, setOpen] = useState(false)

  const fetcher = useCallback(
    () =>
      ai.network({
        cell_label: cellLabel,
        existing_content: cell.existing.trim() || '(尚未填寫)',
      }),
    [cellLabel, cell.existing],
  )
  const { status, data, error, run, reset } = useAI<DirectionsResponse>(fetcher)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  const apply = (d: AIDirection) => {
    const formatted = `【${d.label}】${d.summary}\n→ 本週:${d.next_step}`
    const next = cell.opportunity.trim()
      ? cell.opportunity.trim() + '\n\n' + formatted
      : formatted
    setCell(cellKey, 'opportunity', next)
    setOpen(false)
  }

  return (
    <>
      <AITrigger label="三個開發方向" onClick={() => setOpen(true)} />
      <AISuggestionsDialog
        open={open}
        onOpenChange={handleOpenChange}
        title={`${cellLabel} · 三個開發方向`}
        description="基於你寫的「現有」人脈當跳板,3 個本週可動的擴展方向。選一個寫進「開發」欄位。"
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
                  applyLabel="寫進開發"
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
