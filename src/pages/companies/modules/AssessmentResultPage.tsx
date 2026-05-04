import { Link, Navigate, useParams } from "react-router-dom";
import TopNav from "@/components/TopNav";
import RadarChart from "@/components/RadarChart";
import { useCompany } from "@/hooks/useCompanies";
import { useAssessmentResult } from "@/hooks/useAssessment";
import { ASSESSMENT_SECTIONS, type AssessmentSection } from "@/lib/assessment";

export default function AssessmentResultPage() {
  const { id } = useParams<{ id: string }>();
  const { data: company } = useCompany(id);
  const { data: result, isLoading } = useAssessmentResult(id);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">載入中…</p>
      </main>
    );
  }
  if (!company) return <Navigate to="/home" replace />;
  if (!result) {
    return (
      <>
        <TopNav />
        <main className="max-w-2xl mx-auto px-6 py-12 space-y-4 text-center">
          <h1 className="font-serif text-2xl">尚未完成診斷</h1>
          <Link
            to={`/companies/${company.id}/assessment`}
            className="inline-flex h-10 px-5 items-center bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
          >
            開始填答
          </Link>
        </main>
      </>
    );
  }

  const { scores, challenges_ranked, observations, completed_at } =
    result.payload;

  const radarData = ASSESSMENT_SECTIONS.map((s) => ({
    label: s.label,
    value: scores[s.key as AssessmentSection] ?? 0,
  }));

  const minSection = ASSESSMENT_SECTIONS.reduce((min, s) =>
    (scores[s.key as AssessmentSection] ?? 5) <
    (scores[min.key as AssessmentSection] ?? 5)
      ? s
      : min,
  );
  const maxSection = ASSESSMENT_SECTIONS.reduce((max, s) =>
    (scores[s.key as AssessmentSection] ?? 0) >
    (scores[max.key as AssessmentSection] ?? 0)
      ? s
      : max,
  );

  return (
    <>
      <TopNav />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div>
          <Link
            to={`/companies/${company.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            ← {company.name}
          </Link>
          <div className="flex items-baseline justify-between gap-3 mt-2 flex-wrap">
            <h1 className="font-serif text-3xl">影響力密碼診斷結果</h1>
            <Link
              to={`/companies/${company.id}/assessment`}
              className="text-xs text-muted-foreground hover:text-foreground transition"
            >
              重新作答 →
            </Link>
          </div>
          {completed_at && (
            <p className="text-xs text-muted-foreground mt-1">
              完成時間：
              {new Date(completed_at).toLocaleString("zh-TW")}
            </p>
          )}
        </div>

        {/* 5 力雷達 */}
        <section className="grid md:grid-cols-2 gap-8 items-center border border-border rounded-lg p-6">
          <div className="flex justify-center">
            <RadarChart data={radarData} size={340} />
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              5 力分數
            </h2>
            <ul className="space-y-2">
              {ASSESSMENT_SECTIONS.map((s) => {
                const v = scores[s.key as AssessmentSection] ?? 0;
                const isMin = s.key === minSection.key;
                const isMax = s.key === maxSection.key;
                return (
                  <li
                    key={s.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="font-medium">{s.label}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-1.5 bg-muted rounded">
                        <div
                          className="h-full bg-primary rounded"
                          style={{ width: `${(v / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-9 text-right">
                        {v.toFixed(1)}
                      </span>
                      {isMin && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 w-7">
                          最弱
                        </span>
                      )}
                      {isMax && !isMin && (
                        <span className="text-xs text-green-700 dark:text-green-400 w-7">
                          最強
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* AI 觀察 */}
        {observations && observations.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              AI 顧問觀察
            </h2>
            <div className="space-y-4">
              {observations.map((p, i) => (
                <div
                  key={i}
                  className="border border-border rounded-lg p-5 leading-relaxed text-sm"
                >
                  <span className="text-xs text-muted-foreground block mb-2">
                    {i === 0
                      ? "主要強項"
                      : i === 1
                        ? "最關鍵的弱點"
                        : "建議第一步行動"}
                  </span>
                  {p}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 12 挑戰排名 */}
        {challenges_ranked && challenges_ranked.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              優先處理挑戰（AI 排名）
            </h2>
            <ol className="space-y-2">
              {challenges_ranked.map((c) => (
                <li
                  key={c.key}
                  className="flex items-center gap-4 border border-border rounded-md px-4 py-3"
                >
                  <span className="font-serif text-2xl text-primary w-8">
                    {c.rank}
                  </span>
                  <span className="text-sm flex-1">{c.display_text}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="border border-dashed border-border rounded-lg p-5 bg-muted/20 text-xs text-muted-foreground">
          <p>
            💡 這份結果會被 360 戰略模組讀取，作為制定 5 年戰略的 context。
            建議接著做品牌力（如果分數低）或進入戰略模組。
          </p>
        </section>
      </main>
    </>
  );
}
