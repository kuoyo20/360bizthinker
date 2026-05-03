import { Navigate } from "react-router-dom";
import TopNav from "@/components/TopNav";
import { useUserContext } from "@/hooks/useUserContext";

export default function AdminDashboard() {
  const { isCoach, activeWorkspace, loading } = useUserContext();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">載入中…</p>
      </main>
    );
  }

  if (!isCoach) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <TopNav />
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            顧問後台
          </p>
          <h1 className="font-serif text-3xl">{activeWorkspace?.name}</h1>
        </div>

        <section className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "課程班 (Cohort)", value: "0", hint: "W2 建置" },
            { label: "學員", value: "0", hint: "W2 建置" },
            { label: "公司", value: "0", hint: "W2 建置" },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-border rounded-lg p-5 space-y-1"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="text-3xl font-serif">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </section>

        <section className="border border-dashed border-border rounded-lg p-6 bg-muted/20">
          <h2 className="text-sm font-medium mb-3">W2 將建置</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>Cohort CRUD（建/編/刪 + 邀請碼自動生成）</li>
            <li>學員批次邀請（email 列表 + 模組權限預設）</li>
            <li>學員列表 + 詳情（看學員所有 companies + 模組產出狀態）</li>
            <li>每位學員的模組權限 toggle</li>
          </ul>
        </section>
      </main>
    </>
  );
}
