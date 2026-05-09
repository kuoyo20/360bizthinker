import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import TopNav from "@/components/TopNav";
import { useCompany } from "@/hooks/useCompanies";
import {
  useGenerateStrategyDraft,
  useSaveStrategy,
  useStrategyData,
} from "@/hooks/useStrategy";
import {
  emptyStrategyPayload,
  IMPACT_LABEL,
  MODULE_LABEL,
  PESTEL_KEYS,
  PESTEL_LABEL,
  type ImpactLevel,
  type StrategyPayload,
  visionFilled,
  environmentFilled,
  onePagerFilled,
} from "@/lib/strategy";

type Tab = "vision" | "environment" | "one_pager";

const ALL_KNOWN_MODULES = [
  "assessment",
  "capability_eval",
  "contact_network",
  "sales_pipeline",
  "brand_os",
];

export default function StrategyPage() {
  const { id } = useParams<{ id: string }>();
  const { data: company, isLoading: cLoading } = useCompany(id);
  const { data: existing, isLoading: pLoading } = useStrategyData(id);
  const save = useSaveStrategy(id);
  const draft = useGenerateStrategyDraft(id);

  const [tab, setTab] = useState<Tab>("vision");
  const [payload, setPayload] = useState<StrategyPayload>(emptyStrategyPayload);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated || pLoading) return;
    if (existing?.payload) setPayload(existing.payload);
    setHydrated(true);
  }, [existing, pLoading, hydrated]);

  const used = payload.cross_module_refs?.used ?? [];

  async function onAIDraft() {
    setError(null);
    try {
      const result = await draft.mutateAsync();
      setPayload(result.payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function persist(status: "draft" | "in_progress" | "completed") {
    setError(null);
    try {
      await save.mutateAsync({ payload, status });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  if (cLoading || pLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">載入中…</p>
      </main>
    );
  }
  if (!company) return <Navigate to="/home" replace />;

  const filled = {
    vision: visionFilled(payload),
    environment: environmentFilled(payload),
    one_pager: onePagerFilled(payload),
  };
  const allFilled = filled.vision && filled.environment && filled.one_pager;

  return (
    <>
      <TopNav />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div>
          <Link
            to={`/companies/${company.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            ← {company.name}
          </Link>
          <h1 className="font-serif text-3xl mt-2">360 戰略</h1>
          <p className="text-sm text-muted-foreground mt-1">
            願景 → PESTEL 環境 → 一頁戰略書。AI 起草會讀入你的影響力密碼、能力評分、品牌大師資料。
          </p>
        </div>

        {/* AI Draft section */}
        <section className="border border-border rounded-lg p-5 bg-muted/30 space-y-4">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-medium">✨ AI 起草（讀入跨模組 context）</h2>
            <p className="text-xs text-muted-foreground">
              {used.length > 0
                ? `上次引用：${used.map((u) => MODULE_LABEL[u] ?? u).join(" · ")}`
                : "尚未起草"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {ALL_KNOWN_MODULES.map((m) => (
              <span
                key={m}
                className={`px-2 py-1 rounded border ${
                  used.includes(m)
                    ? "border-primary text-primary bg-primary/5"
                    : "border-border text-muted-foreground"
                }`}
              >
                {used.includes(m) ? "✓" : "○"} {MODULE_LABEL[m] ?? m}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onAIDraft}
              disabled={draft.isPending}
              className="h-10 px-5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {draft.isPending
                ? "AI 起草中…（15-30 秒）"
                : used.length > 0
                  ? "重新起草"
                  : "✨ AI 起草 3 段戰略"}
            </button>
            <p className="text-xs text-muted-foreground">
              起草後你可以逐段修改，故意留 1-2 處「待補充」激發思考。
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3 whitespace-pre-line">
              {error}
            </p>
          )}
        </section>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border -mx-6 px-6">
          {([
            ["vision",      "1. 願景"],
            ["environment", "2. 環境"],
            ["one_pager",   "3. 一頁戰略書"],
          ] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k as Tab)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px transition ${
                tab === k
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {filled[k as Tab] && <span className="ml-1.5 text-green-600">✓</span>}
            </button>
          ))}
        </div>

        {tab === "vision" && (
          <VisionTab payload={payload} setPayload={setPayload} />
        )}
        {tab === "environment" && (
          <EnvironmentTab payload={payload} setPayload={setPayload} />
        )}
        {tab === "one_pager" && (
          <OnePagerTab payload={payload} setPayload={setPayload} />
        )}

        {/* Save bar */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border -mx-6 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {existing?.status === "completed" && existing.completed_at
              ? `已完成（${new Date(existing.completed_at).toLocaleDateString("zh-TW")}）`
              : existing
                ? "進行中"
                : "尚未儲存"}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => persist("in_progress")}
              disabled={save.isPending}
              className="h-9 px-4 border border-border rounded-md text-sm hover:bg-muted transition disabled:opacity-60"
            >
              {save.isPending ? "儲存中…" : "暫存"}
            </button>
            <button
              onClick={() => persist("completed")}
              disabled={save.isPending || !allFilled}
              title={!allFilled ? "需要 3 段都至少有內容" : ""}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {save.isPending ? "儲存中…" : "完成戰略 →"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

// =============================================================
// Tab 1：願景
// =============================================================

function VisionTab(props: {
  payload: StrategyPayload;
  setPayload: (fn: (p: StrategyPayload) => StrategyPayload) => void;
}) {
  const { payload, setPayload } = props;
  const v = payload.vision;
  const set = (patch: Partial<typeof v>) =>
    setPayload((p) => ({ ...p, vision: { ...p.vision, ...patch } }));

  return (
    <div className="space-y-5">
      <Field
        label="10 年後的場景"
        hint="閉上眼睛想像 10 年後你的公司在做什麼？市場長什麼樣？150 字內。"
        value={v.ten_year_scene}
        onChange={(s) => set({ ten_year_scene: s })}
        rows={4}
      />
      <Field
        label="核心能力"
        hint="1-3 個你做得好、別人很難跟的事。"
        value={v.core_capabilities}
        onChange={(s) => set({ core_capabilities: s })}
        rows={3}
      />
      <Field
        label="要解決的問題"
        hint="客戶遇到什麼具體痛點是你能解的？"
        value={v.problem_solved}
        onChange={(s) => set({ problem_solved: s })}
        rows={3}
      />
      <Field
        label="影響的對象 / 產業"
        hint="解決後，哪些人或產業會因此變好？方向是什麼？"
        value={v.impact_target}
        onChange={(s) => set({ impact_target: s })}
        rows={3}
      />
    </div>
  );
}

// =============================================================
// Tab 2：環境（PESTEL + 市場規模）
// =============================================================

function EnvironmentTab(props: {
  payload: StrategyPayload;
  setPayload: (fn: (p: StrategyPayload) => StrategyPayload) => void;
}) {
  const { payload, setPayload } = props;
  const env = payload.environment;
  const setPestel = (key: typeof PESTEL_KEYS[number], factor: string) =>
    setPayload((p) => ({
      ...p,
      environment: {
        ...p.environment,
        pestel: { ...p.environment.pestel, [key]: { ...p.environment.pestel[key], factor } },
      },
    }));
  const setImpact = (key: typeof PESTEL_KEYS[number], impact: ImpactLevel) =>
    setPayload((p) => ({
      ...p,
      environment: {
        ...p.environment,
        pestel: { ...p.environment.pestel, [key]: { ...p.environment.pestel[key], impact } },
      },
    }));
  const setMarket = (patch: Partial<typeof env.market>) =>
    setPayload((p) => ({
      ...p,
      environment: { ...p.environment, market: { ...p.environment.market, ...patch } },
    }));

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          PESTEL 6 維分析
        </h2>
        <ul className="space-y-3">
          {PESTEL_KEYS.map((k) => (
            <li
              key={k}
              className="grid grid-cols-[100px_1fr_120px] gap-3 items-start"
            >
              <span className="text-sm pt-2">{PESTEL_LABEL[k]}</span>
              <textarea
                value={env.pestel[k].factor}
                onChange={(e) => setPestel(k, e.target.value)}
                rows={2}
                placeholder="這個維度有什麼關鍵因素影響你？"
                className="px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
              <select
                value={env.pestel[k].impact}
                onChange={(e) => setImpact(k, e.target.value as ImpactLevel)}
                className="h-10 px-3 border border-border rounded-md bg-background"
              >
                {(["low", "medium", "high"] as ImpactLevel[]).map((i) => (
                  <option key={i} value={i}>
                    影響：{IMPACT_LABEL[i]}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          市場規模估計（億 NTD）
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <NumberField
            label="TAM（總市場）"
            value={env.market.tam_billion_ntd}
            onChange={(v) => setMarket({ tam_billion_ntd: v })}
          />
          <NumberField
            label="SAM（可服務）"
            value={env.market.sam_billion_ntd}
            onChange={(v) => setMarket({ sam_billion_ntd: v })}
          />
          <NumberField
            label="SOM（可拿下）"
            value={env.market.som_billion_ntd}
            onChange={(v) => setMarket({ som_billion_ntd: v })}
          />
        </div>
        <Field
          label="估算依據（一行）"
          hint="例：依據經濟部 2024 報告 + 公司目前市占 X%"
          value={env.market.notes}
          onChange={(s) => setMarket({ notes: s })}
          rows={2}
        />
      </section>
    </div>
  );
}

// =============================================================
// Tab 3：一頁戰略書
// =============================================================

function OnePagerTab(props: {
  payload: StrategyPayload;
  setPayload: (fn: (p: StrategyPayload) => StrategyPayload) => void;
}) {
  const { payload, setPayload } = props;
  const o = payload.one_pager;
  const set = (patch: Partial<typeof o>) =>
    setPayload((p) => ({ ...p, one_pager: { ...p.one_pager, ...patch } }));

  return (
    <div className="space-y-5">
      <Field
        label="現況 (Where we are)"
        hint="基於前面診斷，公司目前最真實的狀態是什麼？"
        value={o.where_we_are}
        onChange={(s) => set({ where_we_are: s })}
        rows={3}
      />
      <Field
        label="目標 (Where to go)"
        hint="3 年後，希望公司變成什麼樣？"
        value={o.where_to_go}
        onChange={(s) => set({ where_to_go: s })}
        rows={3}
      />
      <Field
        label="路徑 (How to get there)"
        hint="3 步以內的關鍵路徑。"
        value={o.how_to_get_there}
        onChange={(s) => set({ how_to_get_there: s })}
        rows={4}
      />
      <Field
        label="不做什麼 (What to avoid)"
        hint="明確列出你決定不做的事 — 戰略的本質是「選擇放棄」。"
        value={o.what_to_avoid}
        onChange={(s) => set({ what_to_avoid: s })}
        rows={3}
      />
      <Field
        label="30 天起點 (First 30 days)"
        hint="明天可以開始的第一個具體動作。"
        value={o.first_30_days}
        onChange={(s) => set({ first_30_days: s })}
        rows={3}
      />
    </div>
  );
}

// =============================================================
// Reusable inputs
// =============================================================

function Field(props: {
  label: string;
  hint?: string;
  value: string;
  onChange: (s: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium block">{props.label}</label>
      {props.hint && (
        <p className="text-xs text-muted-foreground">{props.hint}</p>
      )}
      <textarea
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        rows={props.rows ?? 3}
        className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm leading-relaxed"
      />
    </div>
  );
}

function NumberField(props: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted-foreground block">
        {props.label}
      </label>
      <input
        type="number"
        step="0.1"
        value={props.value ?? ""}
        onChange={(e) =>
          props.onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        placeholder="—"
        className="w-full h-10 px-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}
