import TopNav from "@/components/TopNav";
import { useUserContext } from "@/hooks/useUserContext";

export default function Home() {
  const { activeWorkspace, activeRole, loading } = useUserContext();

  return (
    <>
      <TopNav />
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl">學員首頁</h1>
          <p className="text-sm text-muted-foreground">
            這裡會列出你的公司 + 各模組進度。W2 任務待建。
          </p>
        </div>

        <section className="border border-border rounded-lg p-6 space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            目前狀態
          </h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">載入中…</p>
          ) : (
            <ul className="text-sm space-y-1">
              <li>
                Workspace：<strong>{activeWorkspace?.name ?? "—"}</strong>
              </li>
              <li>
                角色：<strong>{activeRole ?? "—"}</strong>
              </li>
            </ul>
          )}
        </section>

        <section className="border border-dashed border-border rounded-lg p-6 bg-muted/20">
          <h2 className="text-sm font-medium mb-3">W2 將建置</h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>「我的公司」（own）+「我服務的客戶」（client）兩區</li>
            <li>「+ 建立第一間公司」CTA</li>
            <li>每間公司下顯示 6 個模組卡片（已開通 / 進行中 / 已完成）</li>
          </ul>
        </section>
      </main>
    </>
  );
}
