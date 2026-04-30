import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Download, RotateCcw } from 'lucide-react'
import { MODULES } from '@/lib/modules'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SidebarProps {
  m4Progress: { filled: number; total: number }
  onExport: () => void
  onReset: () => void
}

export function Sidebar({ m4Progress, onExport, onReset }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 border-r border-line-light bg-paper-card flex flex-col">
      <div className="px-5 py-6 border-b border-line-light">
        <div className="font-serif text-xl font-bold text-brand">銷售軍師</div>
        <div className="text-xs text-ink-muted mt-0.5 font-mono">Sales Strategist · Yo</div>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-brand-light text-brand font-medium'
                : 'text-ink-secondary hover:bg-brand-light/50 hover:text-brand',
            )
          }
        >
          <LayoutDashboard className="size-4" />
          <span>總覽</span>
        </NavLink>

        <div className="px-5 pt-4 pb-1.5 text-[10px] uppercase tracking-wider text-ink-muted font-mono">
          模組
        </div>

        {MODULES.map((m) => {
          const isM4 = m.id === 'm4'
          const showProgress = isM4 && m4Progress.filled > 0
          return m.enabled ? (
            <NavLink
              key={m.id}
              to={m.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-light text-brand font-medium'
                    : 'text-ink-secondary hover:bg-brand-light/50 hover:text-brand',
                )
              }
            >
              <span className="font-mono text-xs text-ink-muted">{m.number}</span>
              <m.icon className="size-4" />
              <span className="flex-1 truncate">{m.label}</span>
              {showProgress && (
                <Badge variant="secondary" className="text-[10px] px-1.5">
                  {m4Progress.filled}/{m4Progress.total}
                </Badge>
              )}
            </NavLink>
          ) : (
            <div
              key={m.id}
              className="flex items-center gap-3 px-5 py-2.5 text-sm text-ink-muted opacity-60 cursor-not-allowed"
              title="即將推出"
            >
              <span className="font-mono text-xs">{m.number}</span>
              <m.icon className="size-4" />
              <span className="flex-1 truncate">{m.label}</span>
              <Badge variant="muted" className="text-[10px] px-1.5">
                即將推出
              </Badge>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-line-light p-3 space-y-1">
        <button
          type="button"
          onClick={onExport}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-secondary hover:bg-brand-light/50 hover:text-brand rounded-md transition-colors"
        >
          <Download className="size-4" />
          匯出
        </button>
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-ink-secondary hover:bg-accent-red/10 hover:text-accent-red rounded-md transition-colors"
        >
          <RotateCcw className="size-4" />
          重置全部
        </button>
      </div>
    </aside>
  )
}
