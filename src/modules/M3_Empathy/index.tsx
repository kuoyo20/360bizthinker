import { useState } from 'react'
import { useM3Completion, useStore } from '@/store/useStore'
import { Badge } from '@/components/ui/badge'
import { IndustryTemplateSelect } from './IndustryTemplateSelect'
import { OrgChart } from './OrgChart'
import { EmpathyMapEditor } from './EmpathyMapEditor'
import { AIConflictTrigger } from './AIConflictTrigger'

export function M3Empathy() {
  const completion = useM3Completion()
  const analysis = useStore((s) => s.m3_empathy.analysis)
  const hasAnalysis = !!(analysis.conflicts || analysis.excited_resistant || analysis.attack_path)

  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)

  return (
    <div className="px-10 py-10 max-w-6xl">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-xs text-ink-muted">③</span>
          <h1 className="font-serif text-3xl font-bold text-ink-primary">多角色同理心地圖</h1>
          <Badge variant="secondary">
            {completion.filled}/{completion.total} 角色已填完
          </Badge>
        </div>
        <p className="text-ink-secondary max-w-3xl">
          B2B 銷售要打的不是一個人,是一張組織圖。先建組織關係圖,再為每個角色填同理心地圖,
          最後讓 AI 分析角色間的利益衝突與攻擊路徑。
        </p>
      </header>

      {/* Stage 1: Industry template */}
      <section className="mb-8">
        <h2 className="font-serif text-lg font-bold text-ink-primary mb-2">
          ①&nbsp; 選產業模板
        </h2>
        <p className="text-sm text-ink-secondary mb-3">
          帶入該產業常見的關鍵角色組合,當然你也可以後面手動加 / 刪。
        </p>
        <IndustryTemplateSelect />
      </section>

      {/* Stage 1: Org chart */}
      <section className="mb-12">
        <h2 className="font-serif text-lg font-bold text-ink-primary mb-2">
          ②&nbsp; 組織關係圖
        </h2>
        <p className="text-sm text-ink-secondary mb-4">
          標 KEYMAN(王冠按鈕)、填三個層級的聯絡人 + 態度(++ / + / -)。點「填寫」進入該角色的同理心地圖。
        </p>
        <OrgChart onOpenEmpathy={(id) => setEditingRoleId(id)} />
      </section>

      {/* Stage 2: trigger via dialog (handled by editingRoleId state) */}
      {editingRoleId && (
        <EmpathyMapEditor
          roleId={editingRoleId}
          onOpenChange={(open) => !open && setEditingRoleId(null)}
        />
      )}

      {/* Stage 3: Conflict analysis */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink-primary">
              ③&nbsp; 衝突 + 攻擊路徑分析
            </h2>
            <p className="text-sm text-ink-secondary">
              至少 2 個角色填完痛點 + 爽點,才能呼叫分析。
            </p>
          </div>
          <AIConflictTrigger />
        </div>

        {hasAnalysis ? (
          <div className="space-y-3">
            {analysis.conflicts && (
              <article className="rounded-md border border-accent-red/30 bg-accent-red/5 p-4">
                <h3 className="font-serif font-bold text-sm text-accent-red mb-1">
                  角色間利益衝突
                </h3>
                <p className="text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
                  {analysis.conflicts}
                </p>
              </article>
            )}
            {analysis.excited_resistant && (
              <article className="rounded-md border border-accent-gold/30 bg-accent-gold/5 p-4">
                <h3 className="font-serif font-bold text-sm text-accent-gold mb-1">
                  誰最興奮 / 誰最抗拒
                </h3>
                <p className="text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
                  {analysis.excited_resistant}
                </p>
              </article>
            )}
            {analysis.attack_path && (
              <article className="rounded-md border border-accent-green/30 bg-accent-green/5 p-4">
                <h3 className="font-serif font-bold text-sm text-accent-green mb-1">
                  攻擊路徑建議
                </h3>
                <p className="text-sm text-ink-primary leading-relaxed whitespace-pre-wrap">
                  {analysis.attack_path}
                </p>
              </article>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-line-medium bg-paper-card/50 p-6 text-center text-sm text-ink-muted">
            還沒分析過 — 填好幾個角色的痛點 + 爽點後,點上方按鈕讓 AI 分析。
          </div>
        )}
      </section>
    </div>
  )
}
