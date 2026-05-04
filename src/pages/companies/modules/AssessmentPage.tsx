import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import TopNav from "@/components/TopNav";
import { useCompany } from "@/hooks/useCompanies";
import {
  useAssessmentQuestions,
  useAssessmentResult,
} from "@/hooks/useAssessment";
import {
  ASSESSMENT_SECTIONS,
  draftKey,
  SCORE_LABELS,
  type AssessmentAnswer,
  type AssessmentQuestion,
  type AssessmentSection,
} from "@/lib/assessment";
import { supabase } from "@/lib/supabase";

export default function AssessmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: company, isLoading: cLoading } = useCompany(id);
  const { data: questions, isLoading: qLoading } = useAssessmentQuestions();
  const { data: existing } = useAssessmentResult(id);

  const [activeSection, setActiveSection] = useState<AssessmentSection>("strategy");
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!id) return;
    const draft = localStorage.getItem(draftKey(id));
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === "object") setAnswers(parsed);
      } catch {
        // ignore
      }
    }
  }, [id]);

  // Save draft on every change
  useEffect(() => {
    if (!id) return;
    if (Object.keys(answers).length === 0) return;
    localStorage.setItem(draftKey(id), JSON.stringify(answers));
  }, [id, answers]);

  const sectionQuestions = useMemo(() => {
    const groups: Record<AssessmentSection, AssessmentQuestion[]> = {
      strategy: [],
      brand: [],
      ops: [],
      sales: [],
      mgmt: [],
    };
    questions?.forEach((q) => groups[q.section].push(q));
    return groups;
  }, [questions]);

  const sectionAnsweredCount = (sec: AssessmentSection) =>
    sectionQuestions[sec].filter((q) => answers[q.id]?.score).length;

  const totalAnswered = Object.values(answers).filter((a) => a.score).length;
  const allAnswered = totalAnswered === 60;

  const sectionIdx = ASSESSMENT_SECTIONS.findIndex((s) => s.key === activeSection);
  const isLastSection = sectionIdx === ASSESSMENT_SECTIONS.length - 1;
  const isFirstSection = sectionIdx === 0;

  function setScore(qid: string, score: number) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: { question_id: qid, score, comment: prev[qid]?.comment },
    }));
  }

  function setComment(qid: string, comment: string) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        question_id: qid,
        score: prev[qid]?.score ?? 0,
        comment,
      },
    }));
  }

  async function onSubmit() {
    if (!allAnswered) {
      setError("還有題目沒答完，請確保每題都評分。");
      const firstUnansweredSection = ASSESSMENT_SECTIONS.find(
        (s) => sectionAnsweredCount(s.key) < 12,
      );
      if (firstUnansweredSection) setActiveSection(firstUnansweredSection.key);
      return;
    }
    setSubmitting(true);
    setError(null);

    const validAnswers = Object.values(answers)
      .filter((a) => a.score >= 1 && a.score <= 5)
      .map((a) => ({
        question_id: a.question_id,
        score: a.score,
        ...(a.comment ? { comment: a.comment } : {}),
      }));

    const { data, error: fnErr } = await supabase.functions.invoke(
      "generate-assessment-report",
      { body: { company_id: id, answers: validAnswers } },
    );

    setSubmitting(false);
    if (fnErr) {
      setError(fnErr.message);
      return;
    }
    if (data?.error) {
      setError(data.message ?? data.error);
      return;
    }

    localStorage.removeItem(draftKey(id!));
    qc.invalidateQueries({ queryKey: ["assessment-result", id] });
    qc.invalidateQueries({ queryKey: ["company-modules", id] });
    navigate(`/companies/${id}/assessment/result`, { replace: true });
  }

  if (cLoading || qLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">載入中…</p>
      </main>
    );
  }
  if (!company) return <Navigate to="/home" replace />;

  const currentQs = sectionQuestions[activeSection];
  const currentSectionMeta = ASSESSMENT_SECTIONS[sectionIdx];

  return (
    <>
      <TopNav />
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <Link
            to={`/companies/${company.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            ← {company.name}
          </Link>
          <h1 className="font-serif text-3xl mt-2">影響力密碼診斷</h1>
          <p className="text-sm text-muted-foreground mt-1">
            60 題，5 個面向。每題評 1（完全不符合）— 5（非常符合）。
            {existing && (
              <span className="text-xs ml-2 text-amber-700 dark:text-amber-400">
                ⚠️ 你已有上次結果，提交會覆蓋。
              </span>
            )}
          </p>
        </div>

        {/* progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>已答 {totalAnswered} / 60</span>
            <span className="text-muted-foreground">
              {Math.round((totalAnswered / 60) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(totalAnswered / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* section tabs */}
        <div className="flex gap-2 overflow-x-auto -mx-6 px-6">
          {ASSESSMENT_SECTIONS.map((s) => {
            const count = sectionAnsweredCount(s.key);
            const active = s.key === activeSection;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`shrink-0 px-3 py-2 rounded-md text-sm border transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {s.label}
                <span
                  className={`ml-1.5 text-xs ${
                    active ? "opacity-90" : "text-muted-foreground"
                  }`}
                >
                  {count}/12
                </span>
              </button>
            );
          })}
        </div>

        {/* questions */}
        <div className="space-y-5">
          <div className="border-b border-border pb-2">
            <h2 className="font-serif text-xl">{currentSectionMeta.label}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {currentQs.length} 題
            </p>
          </div>

          {currentQs.map((q, i) => {
            const score = answers[q.id]?.score;
            return (
              <div
                key={q.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground font-mono mt-0.5 shrink-0">
                    {q.id}
                  </span>
                  <p className="text-sm leading-relaxed">
                    Q{i + 1}. {q.text}
                  </p>
                </div>
                <div className="flex gap-1.5 pl-12">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setScore(q.id, n)}
                      title={SCORE_LABELS[n]}
                      className={`w-10 h-10 rounded-md border text-sm font-medium transition ${
                        score === n
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                {score && (
                  <div className="pl-12">
                    <input
                      type="text"
                      placeholder="補充說明（選填）"
                      value={answers[q.id]?.comment ?? ""}
                      onChange={(e) => setComment(q.id, e.target.value)}
                      className="w-full h-9 px-3 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* nav */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
          <button
            onClick={() =>
              setActiveSection(ASSESSMENT_SECTIONS[sectionIdx - 1].key)
            }
            disabled={isFirstSection}
            className="h-10 px-4 border border-border rounded-md text-sm hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← 上一段
          </button>

          {error && (
            <p className="flex-1 text-sm text-red-600 text-center">{error}</p>
          )}

          {isLastSection ? (
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="h-10 px-5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {submitting
                ? "AI 分析中…（10-15 秒）"
                : allAnswered
                  ? "提交，看結果 →"
                  : `還剩 ${60 - totalAnswered} 題`}
            </button>
          ) : (
            <button
              onClick={() =>
                setActiveSection(ASSESSMENT_SECTIONS[sectionIdx + 1].key)
              }
              className="h-10 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition"
            >
              下一段 →
            </button>
          )}
        </div>
      </main>
    </>
  );
}
