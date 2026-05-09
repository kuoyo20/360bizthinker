import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import TopNav from "@/components/TopNav";
import NineBoxChart from "@/components/NineBoxChart";
import { useCompany } from "@/hooks/useCompanies";
import {
  useCapabilityData,
  useSaveCapability,
} from "@/hooks/useCapability";
import {
  avgGroup,
  COMPETENCY_GROUP_LABEL,
  type CapabilityPayload,
  type CompetencyGroup,
  type Employee,
  emptyPayload,
  genId,
  isFullyScored,
} from "@/lib/capability";

type Tab = "org" | "score" | "result";

export default function CapabilityEvalPage() {
  const { id } = useParams<{ id: string }>();
  const { data: company, isLoading: cLoading } = useCompany(id);
  const { data: existing, isLoading: pLoading } = useCapabilityData(id);
  const save = useSaveCapability(id);

  const [tab, setTab] = useState<Tab>("org");
  const [payload, setPayload] = useState<CapabilityPayload>(emptyPayload);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate state from DB once
  useEffect(() => {
    if (hydrated || pLoading) return;
    if (existing?.payload) setPayload(existing.payload);
    setHydrated(true);
  }, [existing, pLoading, hydrated]);

  const fullyScoredCount = useMemo(
    () => payload.employees.filter((e) => isFullyScored(e, payload)).length,
    [payload],
  );
  const allScored =
    payload.employees.length > 0 &&
    fullyScoredCount === payload.employees.length;

  // ── Org mutations ─────────────────────────────────────────────
  function addDepartment(name: string) {
    if (!name.trim()) return;
    setPayload((p) => ({
      ...p,
      departments: [
        ...p.departments,
        { id: genId("dept"), name: name.trim(), parent_id: null },
      ],
    }));
  }
  function removeDepartment(deptId: string) {
    setPayload((p) => ({
      ...p,
      departments: p.departments.filter((d) => d.id !== deptId),
      employees: p.employees.map((e) =>
        e.department_id === deptId ? { ...e, department_id: null } : e,
      ),
    }));
  }
  function addEmployee(emp: Omit<Employee, "id">) {
    if (!emp.name.trim()) return;
    setPayload((p) => ({
      ...p,
      employees: [...p.employees, { ...emp, id: genId("emp") }],
    }));
  }
  function updateEmployee(empId: string, patch: Partial<Employee>) {
    setPayload((p) => ({
      ...p,
      employees: p.employees.map((e) =>
        e.id === empId ? { ...e, ...patch } : e,
      ),
    }));
  }
  function removeEmployee(empId: string) {
    setPayload((p) => {
      const { [empId]: _removed, ...rest } = p.scores;
      return {
        ...p,
        employees: p.employees.filter((e) => e.id !== empId),
        scores: rest,
      };
    });
  }
  function setScore(empId: string, compId: string, score: number) {
    setPayload((p) => ({
      ...p,
      scores: {
        ...p.scores,
        [empId]: { ...(p.scores[empId] ?? {}), [compId]: score },
      },
    }));
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

  return (
    <>
      <TopNav />
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div>
          <Link
            to={`/companies/${company.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            ← {company.name}
          </Link>
          <div className="flex items-baseline justify-between gap-3 flex-wrap mt-2">
            <h1 className="font-serif text-3xl">能力評分</h1>
            <p className="text-xs text-muted-foreground">
              {payload.employees.length > 0 &&
                `已完整評分 ${fullyScoredCount} / ${payload.employees.length} 位`}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            老闆視角單向打分 + 九宮格分布。Phase 1 不做員工自評。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border -mx-6 px-6">
          {([
            ["org",    "1. 組織"],
            ["score",  "2. 評分"],
            ["result", "3. 九宮格"],
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
            </button>
          ))}
        </div>

        {tab === "org" && (
          <OrgTab
            payload={payload}
            addDepartment={addDepartment}
            removeDepartment={removeDepartment}
            addEmployee={addEmployee}
            updateEmployee={updateEmployee}
            removeEmployee={removeEmployee}
          />
        )}
        {tab === "score" && (
          <ScoreTab payload={payload} setScore={setScore} />
        )}
        {tab === "result" && <ResultTab payload={payload} />}

        {/* Save bar */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border -mx-6 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {error && <p className="text-sm text-red-600 flex-1">{error}</p>}
          <p className="text-xs text-muted-foreground">
            {existing?.status === "completed" && existing?.completed_at
              ? `已完成（${new Date(existing.completed_at).toLocaleDateString("zh-TW")}）`
              : existing
                ? "草稿"
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
              disabled={save.isPending || !allScored}
              title={!allScored ? "需要每位員工都完整評分" : ""}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {save.isPending ? "儲存中…" : "完成評分 →"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

// =============================================================
// Tab 1：組織
// =============================================================

function OrgTab(props: {
  payload: CapabilityPayload;
  addDepartment: (name: string) => void;
  removeDepartment: (id: string) => void;
  addEmployee: (emp: Omit<Employee, "id">) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
}) {
  const { payload, addDepartment, removeDepartment, addEmployee, updateEmployee, removeEmployee } =
    props;
  const [deptName, setDeptName] = useState("");
  const [empName, setEmpName] = useState("");
  const [empTitle, setEmpTitle] = useState("");
  const [empDept, setEmpDept] = useState<string>("");
  const [empManager, setEmpManager] = useState(false);

  return (
    <div className="space-y-8">
      {/* Departments */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          部門
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="例：業務部"
            className="flex-1 h-10 px-3 border border-border rounded-md bg-background"
          />
          <button
            onClick={() => {
              addDepartment(deptName);
              setDeptName("");
            }}
            disabled={!deptName.trim()}
            className="h-10 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            + 新增
          </button>
        </div>
        {payload.departments.length === 0 ? (
          <p className="text-sm text-muted-foreground">還沒建部門</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {payload.departments.map((d) => (
              <li
                key={d.id}
                className="border border-border rounded-md px-3 py-1.5 text-sm flex items-center gap-2"
              >
                {d.name}
                <button
                  onClick={() => removeDepartment(d.id)}
                  className="text-muted-foreground hover:text-red-600"
                  title="刪除部門"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Employees */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          員工
        </h2>
        <div className="grid sm:grid-cols-[1fr_1fr_1fr_120px_80px] gap-2">
          <input
            type="text"
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            placeholder="姓名"
            className="h-10 px-3 border border-border rounded-md bg-background"
          />
          <input
            type="text"
            value={empTitle}
            onChange={(e) => setEmpTitle(e.target.value)}
            placeholder="職稱"
            className="h-10 px-3 border border-border rounded-md bg-background"
          />
          <select
            value={empDept}
            onChange={(e) => setEmpDept(e.target.value)}
            className="h-10 px-3 border border-border rounded-md bg-background"
          >
            <option value="">— 選部門 —</option>
            {payload.departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={empManager}
              onChange={(e) => setEmpManager(e.target.checked)}
            />
            是經理
          </label>
          <button
            onClick={() => {
              addEmployee({
                name: empName,
                title: empTitle,
                department_id: empDept || null,
                is_manager: empManager,
              });
              setEmpName("");
              setEmpTitle("");
              setEmpDept("");
              setEmpManager(false);
            }}
            disabled={!empName.trim()}
            className="h-10 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-60"
          >
            + 新增
          </button>
        </div>

        {payload.employees.length === 0 ? (
          <p className="text-sm text-muted-foreground">還沒建員工</p>
        ) : (
          <ul className="divide-y divide-border border border-border rounded-md">
            {payload.employees.map((e) => {
              const dept = payload.departments.find(
                (d) => d.id === e.department_id,
              );
              return (
                <li
                  key={e.id}
                  className="px-4 py-3 flex flex-wrap items-center gap-3"
                >
                  <input
                    type="text"
                    value={e.name}
                    onChange={(ev) =>
                      updateEmployee(e.id, { name: ev.target.value })
                    }
                    className="font-medium bg-transparent border-b border-transparent focus:border-border outline-none"
                  />
                  <input
                    type="text"
                    value={e.title}
                    onChange={(ev) =>
                      updateEmployee(e.id, { title: ev.target.value })
                    }
                    placeholder="職稱"
                    className="text-sm text-muted-foreground bg-transparent border-b border-transparent focus:border-border outline-none"
                  />
                  <span className="text-xs text-muted-foreground">
                    {dept?.name ?? "—"}
                  </span>
                  <label className="text-xs flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={e.is_manager}
                      onChange={(ev) =>
                        updateEmployee(e.id, { is_manager: ev.target.checked })
                      }
                    />
                    經理
                  </label>
                  <button
                    onClick={() => removeEmployee(e.id)}
                    className="text-xs text-muted-foreground hover:text-red-600 ml-auto"
                  >
                    刪除
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

// =============================================================
// Tab 2：評分
// =============================================================

function ScoreTab(props: {
  payload: CapabilityPayload;
  setScore: (empId: string, compId: string, score: number) => void;
}) {
  const { payload, setScore } = props;

  if (payload.employees.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
        請先到「組織」分頁新增員工。
      </div>
    );
  }

  const groups: CompetencyGroup[] = ["core", "professional", "leadership"];

  return (
    <div className="space-y-6">
      {payload.employees.map((emp) => (
        <article key={emp.id} className="border border-border rounded-lg p-5 space-y-4">
          <header className="flex items-baseline justify-between gap-2 flex-wrap">
            <div>
              <h3 className="font-medium">{emp.name}</h3>
              <p className="text-xs text-muted-foreground">
                {emp.title || "—"}
                {emp.is_manager && " · 經理"}
              </p>
            </div>
            <div className="text-xs space-x-3">
              {groups
                .filter((g) => g !== "leadership" || emp.is_manager)
                .map((g) => {
                  const v = avgGroup(emp, payload, g);
                  return (
                    <span key={g}>
                      {COMPETENCY_GROUP_LABEL[g]}：
                      <span className="font-mono ml-1">
                        {v > 0 ? v.toFixed(1) : "—"}
                      </span>
                    </span>
                  );
                })}
            </div>
          </header>

          {groups
            .filter((g) => g !== "leadership" || emp.is_manager)
            .map((g) => (
              <div key={g} className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {COMPETENCY_GROUP_LABEL[g]}
                </p>
                <div className="space-y-1.5">
                  {payload.competencies
                    .filter((c) => c.group === g)
                    .map((c) => {
                      const cur = payload.scores[emp.id]?.[c.id];
                      return (
                        <div
                          key={c.id}
                          className="grid grid-cols-[1fr_auto] items-center gap-3"
                        >
                          <span className="text-sm">{c.label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                onClick={() => setScore(emp.id, c.id, n)}
                                className={`w-9 h-9 rounded-md border text-sm font-medium transition ${
                                  cur === n
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border hover:border-primary/50 hover:bg-muted"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </article>
      ))}
    </div>
  );
}

// =============================================================
// Tab 3：九宮格
// =============================================================

function ResultTab({ payload }: { payload: CapabilityPayload }) {
  if (payload.employees.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
        請先到「組織」+「評分」分頁建立員工並打分。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NineBoxChart employees={payload.employees} payload={payload} />

      <section className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-muted/40 border-b border-border">
          <h3 className="text-sm font-medium">員工分數明細</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground bg-muted/20">
            <tr>
              <th className="text-left px-4 py-2">姓名</th>
              <th className="text-center px-3 py-2">核心</th>
              <th className="text-center px-3 py-2">專業</th>
              <th className="text-center px-3 py-2">領導</th>
              <th className="text-center px-3 py-2">X</th>
              <th className="text-center px-3 py-2">Y</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payload.employees.map((emp) => {
              const core = avgGroup(emp, payload, "core");
              const prof = avgGroup(emp, payload, "professional");
              const lead = avgGroup(emp, payload, "leadership");
              const x =
                emp.is_manager && lead > 0 ? (prof + lead) / 2 : prof;
              const y = core;
              return (
                <tr key={emp.id}>
                  <td className="px-4 py-2">{emp.name}</td>
                  <td className="text-center font-mono">
                    {core > 0 ? core.toFixed(1) : "—"}
                  </td>
                  <td className="text-center font-mono">
                    {prof > 0 ? prof.toFixed(1) : "—"}
                  </td>
                  <td className="text-center font-mono">
                    {emp.is_manager ? (lead > 0 ? lead.toFixed(1) : "—") : "—"}
                  </td>
                  <td className="text-center font-mono">
                    {x > 0 ? x.toFixed(1) : "—"}
                  </td>
                  <td className="text-center font-mono">
                    {y > 0 ? y.toFixed(1) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
