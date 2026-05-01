import { useStore } from '@/store/useStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { EmpathyBasic } from '@/lib/types'
import { AIPainTrigger } from './AIPainTrigger'

interface Props {
  roleId: string | null
  onOpenChange: (open: boolean) => void
}

const BASIC_FIELDS: Array<{ key: keyof EmpathyBasic; label: string; placeholder: string }> = [
  { key: 'name', label: '姓名', placeholder: '王大明' },
  { key: 'gender', label: '性別', placeholder: '男 / 女' },
  { key: 'age', label: '年齡', placeholder: '38' },
  { key: 'position', label: '職位', placeholder: '採購經理' },
  { key: 'work_content', label: '工作內容', placeholder: '管理 5 人團隊,負責原物料採購' },
  { key: 'location', label: '居住地', placeholder: '新北市' },
  { key: 'family', label: '家庭成員', placeholder: '已婚 / 一子' },
  { key: 'income', label: '月可支配', placeholder: '8 萬' },
]

export function EmpathyMapEditor({ roleId, onOpenChange }: Props) {
  const role = useStore((s) => (roleId ? s.m3_empathy.roles.find((r) => r.id === roleId) : null))
  const empathy = useStore((s) => (roleId ? s.m3_empathy.empathy_maps[roleId] : null))
  const setBasic = useStore((s) => s.setM3EmpathyBasic)
  const setText = useStore((s) => s.setM3EmpathyText)

  if (!roleId || !role || !empathy) {
    return (
      <Dialog open={!!roleId} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>角色不存在</DialogTitle>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>{role.label} · 同理心地圖</DialogTitle>
            {role.is_keyman && (
              <Badge variant="warn" className="text-[10px]">
                KEYMAN
              </Badge>
            )}
          </div>
          <DialogDescription>
            填越具體越好 — 痛點與爽點是 AI 衝突分析的關鍵輸入。基本資料填關鍵 3-4 項即可。
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mt-2">
          {/* Basic info column */}
          <section className="rounded-md border border-line-light bg-paper p-3 space-y-2">
            <h3 className="font-serif font-bold text-sm text-ink-primary mb-1">基本資料</h3>
            {BASIC_FIELDS.map((f) => (
              <label key={f.key} className="block">
                <span className="text-[11px] text-ink-muted">{f.label}</span>
                <input
                  type="text"
                  value={empathy.basic[f.key]}
                  onChange={(e) => setBasic(roleId, f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="mt-0.5 w-full text-sm border border-line-light rounded px-2 py-1 focus:outline-none focus:border-brand"
                />
              </label>
            ))}
          </section>

          {/* Empathy quadrants */}
          <section className="space-y-3">
            <FieldBlock
              title="工作想什麼 / 感受什麼"
              hint="擔心、害怕、在意"
              value={empathy.think_feel}
              onChange={(v) => setText(roleId, 'think_feel', v)}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldBlock
                title="工作上聽見什麼"
                hint="客戶 / 主管 / 同事"
                value={empathy.hear}
                onChange={(v) => setText(roleId, 'hear', v)}
                rows={3}
              />
              <FieldBlock
                title="工作上看見什麼"
                hint="市場 / 社群 / 趨勢"
                value={empathy.see}
                onChange={(v) => setText(roleId, 'see', v)}
                rows={3}
              />
            </div>

            <FieldBlock
              title="工作時說什麼 / 做什麼"
              hint="公開態度、外顯行為"
              value={empathy.say_do}
              onChange={(v) => setText(roleId, 'say_do', v)}
              rows={3}
            />
          </section>
        </div>

        {/* Pain / Gain row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="rounded-md border border-accent-red/30 bg-accent-red/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-accent-red">痛點 (Pain)</h3>
              <AIPainTrigger roleId={roleId} />
            </div>
            <p className="text-[11px] text-ink-muted -mt-1">內心恐懼或遺憾、令人沮喪、阻礙前進</p>
            <textarea
              rows={5}
              value={empathy.pain}
              onChange={(e) => setText(roleId, 'pain', e.target.value)}
              placeholder="這個角色的核心痛點..."
              className="w-full text-sm bg-paper-card border border-line-light rounded p-2 resize-none focus:outline-none focus:border-accent-red"
            />
          </div>
          <div className="rounded-md border border-accent-green/30 bg-accent-green/5 p-3 space-y-2">
            <h3 className="font-serif font-bold text-sm text-accent-green">爽點 (Gain)</h3>
            <p className="text-[11px] text-ink-muted -mt-1">消除痛點、超出期待、促使成長 / 順利</p>
            <textarea
              rows={5}
              value={empathy.gain}
              onChange={(e) => setText(roleId, 'gain', e.target.value)}
              placeholder="這個角色被搞定後的甜蜜點..."
              className="w-full text-sm bg-paper-card border border-line-light rounded p-2 resize-none focus:outline-none focus:border-accent-green"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface FieldProps {
  title: string
  hint: string
  value: string
  onChange: (v: string) => void
  rows: number
}

function FieldBlock({ title, hint, value, onChange, rows }: FieldProps) {
  return (
    <div className="rounded-md border border-line-light bg-paper-card p-3">
      <h4 className="font-serif font-bold text-sm text-ink-primary">{title}</h4>
      <p className="text-[11px] text-ink-muted mt-0.5">{hint}</p>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full text-sm bg-transparent border border-line-light rounded p-2 resize-none focus:outline-none focus:border-brand placeholder:text-ink-muted/60"
      />
    </div>
  )
}
