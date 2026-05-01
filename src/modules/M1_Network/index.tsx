import { useM1Completion, useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import type { M1CellKey, M1ListKey } from '@/lib/types'
import { MatrixCell } from './MatrixCell'

const CAREER_CELLS: Array<{ key: M1CellKey; sub: string; hint: string }> = [
  { key: 'career_downstream', sub: '下游', hint: '我服務過 / 想服務的客戶' },
  { key: 'career_upstream', sub: '上游', hint: '我合作過 / 想接觸的供應商 / 通路' },
  { key: 'career_adjacent', sub: '類產業', hint: '同領域的同業 / 競品 / 跨界夥伴' },
]

const EDU_CELLS: Array<{ key: M1CellKey; sub: string; hint: string }> = [
  { key: 'edu_school', sub: '學涯', hint: '同學 / 學長姐 / 老師 / 校友會' },
  { key: 'edu_club', sub: '社團', hint: '社團夥伴 / 興趣群體 / 公會' },
  { key: 'edu_training', sub: '進修', hint: '課程同學 / 講師 / 進修圈' },
]

const LISTS: Array<{ key: M1ListKey; title: string; hint: string }> = [
  {
    key: 'most_contacted_5',
    title: '① 最常聯繫的五個人',
    hint: '不論工作或生活,過去一個月最常聯絡的 5 位',
  },
  {
    key: 'go_to_help_5',
    title: '② 需要幫忙時先想到的五個人',
    hint: '在你心中第一順位求助 / 諮詢的 5 位',
  },
  {
    key: 'role_models',
    title: '③ 想要追隨的目標對象',
    hint: '崇拜 / 想成為的、想得到指點的人(可名人也可身邊的人)',
  },
]

export function M1Network() {
  const completion = useM1Completion()
  const lists = useStore((s) => ({
    most_contacted_5: s.m1_network.most_contacted_5,
    go_to_help_5: s.m1_network.go_to_help_5,
    role_models: s.m1_network.role_models,
  }))
  const setList = useStore((s) => s.setM1List)

  return (
    <div className="px-10 py-10 max-w-6xl">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-ink-muted">①</span>
          <h1 className="font-serif text-3xl font-bold text-ink-primary">人脈三歷</h1>
          <Badge variant="secondary">
            {completion.filled}/{completion.total} 已填
          </Badge>
        </div>
        <p className="text-ink-secondary max-w-3xl">
          盤點你的銷售準備度 — 經歷 × 學歷 × 閱歷,每格都有「現有 / 開發」雙欄。
          每個「開發」欄位右上有 AI 助攻,基於你「現有」當跳板給三個本週可動的方向。
        </p>
      </header>

      {/* 3×3 matrix: 經歷 row */}
      <section className="mb-6">
        <h2 className="font-serif text-lg font-bold text-ink-primary mb-3">經歷</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CAREER_CELLS.map((c) => (
            <MatrixCell
              key={c.key}
              cellKey={c.key}
              category="經歷"
              subLabel={c.sub}
              hint={c.hint}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-lg font-bold text-ink-primary mb-3">學歷</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EDU_CELLS.map((c) => (
            <MatrixCell
              key={c.key}
              cellKey={c.key}
              category="學歷"
              subLabel={c.sub}
              hint={c.hint}
            />
          ))}
        </div>
      </section>

      {/* 閱歷 */}
      <section>
        <h2 className="font-serif text-lg font-bold text-ink-primary mb-1">閱歷</h2>
        <p className="text-sm text-ink-secondary mb-3">
          每格寫 5 個人,可換行分隔。這是攻擊路徑的「槓桿名單」。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LISTS.map((l) => (
            <div key={l.key} className="rounded-md border border-line-light bg-paper-card p-3">
              <div className="font-serif font-bold text-sm text-ink-primary">{l.title}</div>
              <div className="text-[11px] text-ink-muted mt-0.5 mb-2">{l.hint}</div>
              <textarea
                rows={6}
                value={lists[l.key]}
                onChange={(e) => setList(l.key, e.target.value)}
                placeholder={'例:\n王大明\n李小華\n...'}
                className="w-full text-sm bg-transparent border border-line-light rounded p-2 resize-none focus:outline-none focus:border-brand placeholder:text-ink-muted/60 leading-relaxed"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
