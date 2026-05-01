import { useStore } from '@/store/useStore'
import { INDUSTRY_TEMPLATES } from '@/lib/constants'
import type { IndustryTemplate } from '@/lib/types'
import { cn } from '@/lib/utils'

const TEMPLATE_KEYS: IndustryTemplate[] = ['restaurant', 'beverage_chain', 'manufacturing', 'custom']

export function IndustryTemplateSelect() {
  const current = useStore((s) => s.m3_empathy.industry_template)
  const apply = useStore((s) => s.applyM3Template)
  const hasRoles = useStore((s) => s.m3_empathy.roles.length > 0)

  const handleClick = (key: IndustryTemplate) => {
    if (key === current) return
    if (
      hasRoles &&
      !window.confirm(
        '切換產業模板會替換目前的角色清單(同名角色會保留你已填的同理心地圖)。要繼續嗎?',
      )
    ) {
      return
    }
    apply(key)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TEMPLATE_KEYS.map((key) => {
        const t = INDUSTRY_TEMPLATES[key]
        const active = current === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleClick(key)}
            className={cn(
              'rounded-md border px-4 py-2 text-left transition-colors min-w-[160px]',
              active
                ? 'border-brand bg-brand text-white'
                : 'border-line-medium bg-paper-card hover:border-brand hover:bg-brand-light/30',
            )}
          >
            <div className={cn('font-serif font-bold text-sm', active ? 'text-white' : 'text-ink-primary')}>
              {t.label}
            </div>
            <div className={cn('text-xs mt-0.5', active ? 'text-white/80' : 'text-ink-muted')}>
              {t.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
