import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

interface Answer {
  question_id: string;
  score: number;
  comment?: string;
}

interface Payload {
  company_id: string;
  answers: Answer[];
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const SECTION_LABEL: Record<string, string> = {
  strategy: "策略力",
  brand: "品牌力",
  ops: "營運力",
  sales: "銷售力",
  mgmt: "管理力",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "missing auth" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse({ error: "invalid auth" }, 401);

    const body = (await req.json()) as Payload;
    const { company_id, answers } = body;

    if (!company_id || !Array.isArray(answers)) {
      return jsonResponse({ error: "invalid payload" }, 400);
    }
    if (answers.length !== 60) {
      return jsonResponse(
        { error: `expected 60 answers, got ${answers.length}` },
        400,
      );
    }

    // Verify ownership
    const { data: company, error: cErr } = await admin
      .from("companies")
      .select(
        "id, name, industry, workspace_id, owner_student_id, students!inner(user_id)",
      )
      .eq("id", company_id)
      .single<{
        id: string;
        name: string;
        industry: string | null;
        workspace_id: string;
        owner_student_id: string;
        students: { user_id: string };
      }>();
    if (cErr || !company) return jsonResponse({ error: "company not found" }, 404);
    if (company.students.user_id !== user.id) {
      return jsonResponse({ error: "not authorized" }, 403);
    }

    // Load reference data
    const [qResp, cResp] = await Promise.all([
      admin.from("assessment_questions").select("id, section, text"),
      admin
        .from("assessment_challenges")
        .select("*")
        .order("display_order"),
    ]);
    if (qResp.error || !qResp.data) {
      return jsonResponse({ error: "questions not loaded" }, 500);
    }
    const questions = qResp.data as {
      id: string;
      section: string;
      text: string;
    }[];
    const challenges =
      (cResp.data as { key: string; display_text: string }[] | null) ?? [];

    // Index helpers
    const qBySection: Record<string, string[]> = {
      strategy: [],
      brand: [],
      ops: [],
      sales: [],
      mgmt: [],
    };
    const qMap = new Map<string, { id: string; section: string; text: string }>();
    for (const q of questions) {
      qBySection[q.section]?.push(q.id);
      qMap.set(q.id, q);
    }
    const answersById = new Map(
      answers.map((a) => [a.question_id, a] as const),
    );

    // Compute section averages
    const scores: Record<string, number> = {};
    for (const [section, qIds] of Object.entries(qBySection)) {
      if (qIds.length === 0) {
        scores[section] = 0;
        continue;
      }
      const sum = qIds.reduce(
        (s, qid) => s + (answersById.get(qid)?.score ?? 0),
        0,
      );
      scores[section] = Math.round((sum / qIds.length) * 10) / 10;
    }

    // 10 lowest-scored questions for AI prompt
    const lowQs = [...answers]
      .filter((a) => a.score >= 1 && a.score <= 5)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .map((a) => {
        const q = qMap.get(a.question_id);
        return `- [${q ? SECTION_LABEL[q.section] : "?"}] ${q?.text ?? a.question_id} (${a.score}/5)`;
      })
      .join("\n");

    let challengesRanked: { key: string; rank: number; display_text: string }[] = [];
    let observations: string[] = [];
    let aiUsed = false;

    if (ANTHROPIC_API_KEY) {
      try {
        const challengesText = challenges
          .map((c) => `- ${c.key}: ${c.display_text}`)
          .join("\n");

        const systemPrompt = `你是有經驗的中小企業顧問。一個學員（公司：${company.name}${
          company.industry ? `，產業：${company.industry}` : ""
        }）剛完成 60 題影響力密碼診斷。請依據其答題模式，產出建議。輸出時呼叫 generate_report tool。`;

        const userPrompt = `## 5 力分數（每題 1-5，5 為最強）
- 策略力 (strategy): ${scores.strategy}
- 品牌力 (brand): ${scores.brand}
- 營運力 (ops): ${scores.ops}
- 銷售力 (sales): ${scores.sales}
- 管理力 (mgmt): ${scores.mgmt}

## 評分最低的 10 題（潛在弱點）
${lowQs}

## 12 個成長挑戰候選（從中選 Top 5）
${challengesText}

## 任務
1. 從 12 個 challenges 中選出此公司最該優先處理的 Top 5（rank 1 = 最優先）
2. 寫 3 段觀察，每段 80-150 字，繁體中文：
   - 段落 1：主要強項（從 5 力分數 + 高分題目歸納）
   - 段落 2：最關鍵的弱點（指出最低分領域 + 為何這些影響業務）
   - 段落 3：建議第一步行動（具體、可在 30 天內開始）`;

        const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
            tools: [
              {
                name: "generate_report",
                description: "Output the assessment report",
                input_schema: {
                  type: "object",
                  properties: {
                    challenges_ranked: {
                      type: "array",
                      description: "Top 5 challenges ranked by priority",
                      items: {
                        type: "object",
                        properties: {
                          key: {
                            type: "string",
                            enum: challenges.map((c) => c.key),
                          },
                          rank: {
                            type: "integer",
                            minimum: 1,
                            maximum: 5,
                          },
                        },
                        required: ["key", "rank"],
                      },
                      minItems: 5,
                      maxItems: 5,
                    },
                    observations: {
                      type: "array",
                      description: "3 paragraphs in 繁體中文",
                      items: { type: "string" },
                      minItems: 3,
                      maxItems: 3,
                    },
                  },
                  required: ["challenges_ranked", "observations"],
                },
              },
            ],
            tool_choice: { type: "tool", name: "generate_report" },
          }),
        });

        if (!aiResp.ok) {
          const errText = await aiResp.text();
          throw new Error(
            `anthropic ${aiResp.status}: ${errText.slice(0, 200)}`,
          );
        }

        const aiData = (await aiResp.json()) as {
          content: { type: string; input?: unknown }[];
        };
        const toolUse = aiData.content?.find((c) => c.type === "tool_use") as
          | { input: { challenges_ranked: { key: string; rank: number }[]; observations: string[] } }
          | undefined;
        if (!toolUse) throw new Error("no tool_use in response");

        challengesRanked = toolUse.input.challenges_ranked
          .map((r) => ({
            key: r.key,
            rank: r.rank,
            display_text:
              challenges.find((c) => c.key === r.key)?.display_text ?? r.key,
          }))
          .sort((a, b) => a.rank - b.rank);

        observations = toolUse.input.observations;
        aiUsed = true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        observations = [
          `主要強項：分數最高的領域為 ${
            SECTION_LABEL[
              Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
            ]
          }（${Object.entries(scores).sort((a, b) => b[1] - a[1])[0][1]}）。`,
          `最關鍵的弱點：分數最低的領域為 ${
            SECTION_LABEL[
              Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]
            ]
          }（${Object.entries(scores).sort((a, b) => a[1] - b[1])[0][1]}）。AI 分析暫時無法產生（${msg.slice(0, 80)}）。`,
          `建議第一步：聚焦改善最低分領域，並聯絡你的顧問尋求進一步指引。`,
        ];
      }
    } else {
      // No AI key — fallback summary
      const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);
      const weakest = sortedScores[0];
      const strongest = sortedScores[sortedScores.length - 1];
      observations = [
        `主要強項：${SECTION_LABEL[strongest[0]]}（${strongest[1]} 分）— 此面向是你目前最穩固的根基。`,
        `最關鍵的弱點：${SECTION_LABEL[weakest[0]]}（${weakest[1]} 分）— 從評分最低的題目來看，這裡有具體的改善空間。`,
        `建議第一步行動：先專注於${SECTION_LABEL[weakest[0]]}的提升。設置 ANTHROPIC_API_KEY 後可獲得更深入的 AI 分析。`,
      ];
      // Default to challenges by display_order, top 5
      challengesRanked = challenges.slice(0, 5).map((c, i) => ({
        key: c.key,
        rank: i + 1,
        display_text: c.display_text,
      }));
    }

    const moduleDataPayload = {
      answers,
      scores,
      challenges_ranked: challengesRanked,
      observations,
      completed_at: new Date().toISOString(),
    };

    const { error: upErr } = await admin.from("module_data").upsert(
      {
        workspace_id: company.workspace_id,
        company_id: company.id,
        student_id: company.owner_student_id,
        module_type: "assessment",
        payload: moduleDataPayload,
        ai_input: {
          scores,
          low_questions: lowQs,
          ai_used: aiUsed,
        },
        ai_output: {
          challenges_ranked: challengesRanked,
          observations,
        },
        status: "completed",
        completed_at: new Date().toISOString(),
      },
      { onConflict: "company_id,module_type" },
    );

    if (upErr) return jsonResponse({ error: upErr.message }, 500);

    return jsonResponse({
      success: true,
      ai_used: aiUsed,
      scores,
      challenges_ranked: challengesRanked,
      observations,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: msg }, 500);
  }
});
