import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MODULES } from '@/lib/modules'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export function Overview() {
  const m4Progress = useStore((s) => s.getM4Completion())

  return (
    <div className="px-10 py-12 max-w-5xl">
      <header className="mb-10">
        <h1 className="font-serif text-3xl font-bold text-ink-primary">總覽</h1>
        <p className="text-ink-secondary mt-2">
          4 步驟,從個人盤點到客戶攻擊計劃。每個模組都能單獨完成,下方依建議順序排列。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULES.map((m) => {
          const isM4 = m.id === 'm4'
          const progressPct = isM4 ? Math.round((m4Progress.filled / m4Progress.total) * 100) : 0

          const card = (
            <article
              className={cn(
                'rounded-lg border bg-paper-card p-6 transition-all',
                m.enabled
                  ? 'border-line-light hover:border-brand hover:shadow-sm cursor-pointer'
                  : 'border-line-light opacity-60 cursor-not-allowed',
              )}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 size-10 rounded-md bg-brand-light text-brand grid place-items-center">
                  <m.icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-ink-muted">{m.number}</span>
                    <h2 className="font-serif text-lg font-bold text-ink-primary truncate">
                      {m.label}
                    </h2>
                  </div>
                  <p className="text-sm text-ink-secondary mb-4">{m.description}</p>

                  <div className="flex items-center justify-between">
                    {m.enabled ? (
                      isM4 && m4Progress.filled > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 bg-brand-light rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-ink-muted">
                            {m4Progress.filled}/{m4Progress.total}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="muted">未開始</Badge>
                      )
                    ) : (
                      <Badge variant="muted">即將推出</Badge>
                    )}
                    {m.enabled && (
                      <ArrowRight className="size-4 text-ink-muted group-hover:text-brand" />
                    )}
                  </div>
                </div>
              </div>
            </article>
          )

          return m.enabled ? (
            <Link key={m.id} to={m.path} className="group block">
              {card}
            </Link>
          ) : (
            <div key={m.id}>{card}</div>
          )
        })}
      </div>

      <footer className="mt-16 text-center text-xs text-ink-muted font-mono">
        Sales Strategist · v0.1 · Yo Workshop
      </footer>
    </div>
  )
}
