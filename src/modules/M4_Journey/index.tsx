import { JourneyGrid } from './JourneyGrid'
import { EmotionCurve } from './EmotionCurve'
import { useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'

export function M4Journey() {
  const m4Progress = useStore((s) => s.getM4Completion())

  return (
    <div className="px-10 py-10 min-w-[1280px]">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-ink-muted">④</span>
          <h1 className="font-serif text-3xl font-bold text-ink-primary">6×5 客戶旅程地圖</h1>
          <Badge variant="secondary" className="ml-2">
            {m4Progress.filled}/{m4Progress.total} 已填
          </Badge>
        </div>
        <p className="text-ink-secondary max-w-3xl">
          在客戶經營旅程的 6 個階段,規劃你各要問什麼引導問題、預期對方產出什麼答案,並設計 3 個情緒高峰點。
          填空格自動儲存,重新整理也不會掉。
        </p>
      </header>

      <JourneyGrid />

      <section className="mt-12">
        <h2 className="font-serif text-xl font-bold text-ink-primary mb-1">情緒曲線</h2>
        <p className="text-sm text-ink-secondary mb-4">
          依峰終定律與 N.P.S 框架,3 個高峰點分別落在拜訪 / 提案 / 成交階段。
        </p>
        <EmotionCurve />
      </section>
    </div>
  )
}
