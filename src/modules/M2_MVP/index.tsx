import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useM2Completion, useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import type { M2FieldKey } from '@/lib/types'
import { AIVisionTrigger } from './AIVisionTrigger'
import { AIProductTrigger } from './AIProductTrigger'
import { AIPositioningTrigger } from './AIPositioningTrigger'
import { cn } from '@/lib/utils'

export function M2MVP() {
  const completion = useM2Completion()
  const m2 = useStore((s) => s.m2_mvp)
  const setField = useStore((s) => s.setM2Field)
  const [qcOpen, setQcOpen] = useState(!!m2.qc_quantify || !!m2.qc_celebrity)

  return (
    <div className="px-10 py-10 max-w-4xl">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-ink-muted">②</span>
          <h1 className="font-serif text-3xl font-bold text-ink-primary">M.V.P 價值主張</h1>
          <Badge variant="secondary">
            {completion.filled}/{completion.total} 已填
          </Badge>
        </div>
        <p className="text-ink-secondary max-w-3xl">
          用三段式說清楚事業差異化:**我打哪個市場(M) + 我用什麼感性溝通(V) + 我用什麼理性銷售(P)**。
          填完點底下的「生成定位句」收斂成一句。
        </p>
      </header>

      <div className="space-y-6">
        <Section
          letter="M"
          title="我選擇的市場 (Market)"
          question="你的事業 / 產品打哪個市場?"
        >
          <Field
            field="market_target"
            value={m2.market_target}
            placeholder="例:30-45 歲、年營收 1 億以上的高端餐廳老闆..."
            onChange={(v) => setField('market_target', v)}
            rows={3}
          />
        </Section>

        <Section
          letter="V"
          title="我溝通品牌 (Vision / Vibe)"
          question="你想讓客戶感受到什麼?(感性層次,品牌情感連結)"
          ai={<AIVisionTrigger />}
        >
          <Field
            field="vision_emotion"
            value={m2.vision_emotion}
            placeholder="例:讓主廚專心做菜、後勤安心交給我們..."
            onChange={(v) => setField('vision_emotion', v)}
            rows={4}
          />
        </Section>

        <Section
          letter="P"
          title="我銷售產品 (Product)"
          question="你的產品有什麼客戶必須選你的理由?(理性層次,功能性差異化)"
          ai={<AIProductTrigger />}
        >
          <Field
            field="product_rational"
            value={m2.product_rational}
            placeholder="例:18 道後勤工序、14 小時備餐、3 大連鎖背書..."
            onChange={(v) => setField('product_rational', v)}
            rows={4}
          />
        </Section>

        {/* Q.C collapsible */}
        <section className="rounded-lg border border-line-light bg-paper-card overflow-hidden">
          <button
            type="button"
            onClick={() => setQcOpen(!qcOpen)}
            className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-brand-light/30 transition-colors"
          >
            {qcOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            <span className="font-serif text-base font-bold text-ink-primary">
              🎯 Q.C 人無我有 (進階)
            </span>
            <span className="ml-2 text-xs text-ink-muted">量化支持 + 名人 / 形象代表</span>
          </button>
          {qcOpen && (
            <div className="border-t border-line-light p-4 space-y-4">
              <div>
                <div className="font-serif font-bold text-sm text-ink-primary mb-1">
                  Quantify(量化支持)
                </div>
                <div className="text-[11px] text-ink-muted mb-2">
                  例:18 摺痕、14 小時熬煮、99.9% 鮮度、3 大連鎖驗證
                </div>
                <Field
                  field="qc_quantify"
                  value={m2.qc_quantify}
                  placeholder="可量化的數字 / 規格 / 認證..."
                  onChange={(v) => setField('qc_quantify', v)}
                  rows={3}
                />
              </div>
              <div>
                <div className="font-serif font-bold text-sm text-ink-primary mb-1">
                  Celebrity(名人 / 形象代表)
                </div>
                <div className="text-[11px] text-ink-muted mb-2">
                  例:吳寶春+麵包、海底撈+服務、米其林大廚+你的產品
                </div>
                <Field
                  field="qc_celebrity"
                  value={m2.qc_celebrity}
                  placeholder="代表性人物 / 品牌 / 案例..."
                  onChange={(v) => setField('qc_celebrity', v)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </section>

        {/* Positioning */}
        <section className="rounded-lg border border-accent-gold/40 bg-accent-gold/5 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <div>
              <h3 className="font-serif text-base font-bold text-ink-primary">
                定位句(整合 M+V+P)
              </h3>
              <p className="text-xs text-ink-secondary">
                句型:「對於 ___ 來說,與 ___ 相比,我們更 ___、___、___」
              </p>
            </div>
            <AIPositioningTrigger />
          </div>
          <Field
            field="positioning_statement"
            value={m2.positioning_statement}
            placeholder="AI 生成或自己寫一句..."
            onChange={(v) => setField('positioning_statement', v)}
            rows={3}
          />
        </section>
      </div>
    </div>
  )
}

interface SectionProps {
  letter: string
  title: string
  question: string
  ai?: React.ReactNode
  children: React.ReactNode
}

function Section({ letter, title, question, ai, children }: SectionProps) {
  return (
    <section className="rounded-lg border border-line-light bg-paper-card p-4">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={cn(
            'shrink-0 size-9 rounded-md grid place-items-center font-serif font-bold text-lg',
            'bg-brand text-white',
          )}
        >
          {letter}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-base font-bold text-ink-primary">{title}</h2>
          <p className="text-xs text-ink-secondary mt-0.5">Q: {question}</p>
        </div>
        {ai && <div className="shrink-0">{ai}</div>}
      </div>
      {children}
    </section>
  )
}

interface FieldProps {
  field: M2FieldKey
  value: string
  placeholder: string
  onChange: (v: string) => void
  rows: number
}

function Field({ value, placeholder, onChange, rows }: FieldProps) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-sm bg-transparent border border-line-light rounded p-3 resize-none focus:outline-none focus:border-brand placeholder:text-ink-muted/60 leading-relaxed"
    />
  )
}
