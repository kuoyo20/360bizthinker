import { useStore } from '@/store/useStore'
import type { M1CellKey } from '@/lib/types'
import { AINetworkTrigger } from './AINetworkTrigger'

interface Props {
  cellKey: M1CellKey
  category: '經歷' | '學歷'
  subLabel: string
  hint: string
}

export function MatrixCell({ cellKey, category, subLabel, hint }: Props) {
  const cell = useStore((s) => s.m1_network[cellKey])
  const setCell = useStore((s) => s.setM1Cell)
  const fullLabel = `${category} · ${subLabel}`

  return (
    <div className="rounded-md border border-line-light bg-paper-card overflow-hidden">
      <div className="bg-brand-light/40 px-3 py-2 border-b border-line-light">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[10px] text-brand uppercase tracking-wider">
            {category}
          </span>
          <span className="font-serif text-sm font-bold text-ink-primary">{subLabel}</span>
        </div>
        <div className="text-[11px] text-ink-muted mt-0.5">{hint}</div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-line-light">
        <div className="p-2">
          <div className="font-mono text-[10px] text-ink-muted mb-1">現有</div>
          <textarea
            rows={4}
            value={cell.existing}
            onChange={(e) => setCell(cellKey, 'existing', e.target.value)}
            placeholder={`現有的 ${fullLabel}...`}
            className="w-full text-sm bg-transparent border border-line-light rounded p-2 resize-none focus:outline-none focus:border-brand placeholder:text-ink-muted/60"
          />
        </div>
        <div className="p-2">
          <div className="flex items-center justify-between mb-1">
            <div className="font-mono text-[10px] text-ink-muted">開發</div>
            <AINetworkTrigger cellKey={cellKey} cellLabel={fullLabel} />
          </div>
          <textarea
            rows={4}
            value={cell.opportunity}
            onChange={(e) => setCell(cellKey, 'opportunity', e.target.value)}
            placeholder={`想開發的 ${fullLabel}...`}
            className="w-full text-sm bg-transparent border border-line-light rounded p-2 resize-none focus:outline-none focus:border-brand placeholder:text-ink-muted/60"
          />
        </div>
      </div>
    </div>
  )
}
