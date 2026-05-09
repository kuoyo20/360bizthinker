import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

interface ReqPayload { company_id: string; }

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

// =============================================================
// Helpers — format each module's payload as Markdown for AI context
// =============================================================

interface ModuleRow {
  id: string;
  module_type: string;
  payload: any;
  status: string;
  completed_at: string | null;
  updated_at: string;
}

function fmtAssessment(p: any): string {
  if (!p) return "";
  const s = p.scores ?? {};
  const obs = p.observations ?? [];
  const ch = (p.challenges_ranked ?? []).slice(0, 5);
  return [
    `## 影響力密碼診斷（assessment）`,
    `5 力分數（每題 1-5）：策略 ${s.strategy ?? "?"} / 品牌 ${s.brand ?? "?"} / 營運 ${s.ops ?? "?"} / 銷售 ${s.sales ?? "?"} / 管理 ${s.mgmt ?? "?"}`,
    obs.length ? `AI 觀察：\n${obs.map((o: string, i: number) => `${i + 1}. ${o}`).join("\n")}` : "",
    ch.length ? `Top 5 成長挑戰：\n${ch.map((c: any) => `- ${c.display_text}（rank ${c.rank}）`).join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
}

function fmtCapability(p: any): string {
  if (!p) return "";
  const emps = p.employees ?? [];
  const managers = emps.filter((e: any) => e.is_manager).length;
  if (emps.length === 0) return "## 能力評分\n（尚未建立員工）";

  // Compute per-group averages across all employees
  const sumByGroup: Record<string, { sum: number; count: number }> = {
    core: { sum: 0, count: 0 },
    professional: { sum: 0, count: 0 },
    leadership: { sum: 0, count: 0 },
  };
  const comps = p.competencies ?? [];
  for (const emp of emps) {
    const empScores = p.scores?.[emp.id] ?? {};
    for (const c of comps) {
      const v = empScores[c.id];
      if (typeof v !== "number") continue;
      if (c.group === "leadership" && !emp.is_manager) continue;
      sumByGroup[c.group].sum += v;
      sumByGroup[c.group].count += 1;
    }
  }
  const avg = (g: string) =>
    sumByGroup[g].count > 0
      ? (sumByGroup[g].sum / sumByGroup[g].count).toFixed(1)
      : "—";

  return [
    `## 能力評分（capability_eval）`,
    `組織規模：${emps.length} 位員工（其中 ${managers} 位經理）`,
    `平均分數（1-5）：核心職能 ${avg("core")} / 專業能力 ${avg("professional")} / 領導能力 ${avg("leadership")}`,
  ].join("\n");
}

function fmtBrandOS(p: any): string {
  if (!p) return "";
  const py = p.synced_pyramid ?? {};
  const so = p.synced_soul ?? {};
  const lines = [`## 品牌大師（brand_os，從 Brand OS 同步）`];
  if (py.vision) lines.push(`願景：${py.vision}`);
  if (py.mission) lines.push(`使命：${py.mission}`);
  if (py.positioning) lines.push(`定位：${py.positioning}`);
  if (so.archetype) lines.push(`Master 原型：${so.archetype}`);
  if (so.gender_persona) lines.push(`性格傾向：${so.gender_persona}`);
  if (lines.length === 1) lines.push("（尚未同步資料）");
  return lines.join("\n");
}

function fmtContactNetwork(p: any): string {
  if (!p) return "";
  const contacts = p.contacts ?? [];
  return `## 人脈管理（contact_network）\n聯絡人總數：${contacts.length} 人`;
}

function fmtSalesPipeline(p: any): string {
  if (!p) return "";
  const clients = p.clients ?? [];
  return `## 銷售大師（sales_pipeline）\n業務客戶總數：${clients.length}`;
}

function buildContext(
  companyName: string,
  industry: string | null,
  rows: ModuleRow[],
): { markdown: string; used: string[]; ids: string[] } {
  const sections: string[] = [];
  const used: string[] = [];
  const ids: string[] = [];

  sections.push(
    `# 公司：${companyName}${industry ? `（產業：${industry}）` : ""}`,
  );

  for (const row of rows) {
    let s = "";
    if (row.module_type === "assessment") s = fmtAssessment(row.payload);
    else if (row.module_type === "capability_eval") s = fmtCapability(row.payload);
    else if (row.module_type === "brand_os") s = fmtBrandOS(row.payload);
    else if (row.module_type === "contact_network") s = fmtContactNetwork(row.payload);
    else if (row.module_type === "sales_pipeline") s = fmtSalesPipeline(row.payload);
    if (s) {
      sections.push(s);
      used.push(row.module_type);
      ids.push(row.id);
    }
  }

  return { markdown: sections.join("\n\n---\n\n"), used, ids };
}

// =============================================================
// Strategy draft schema (Claude tool input_schema)
// =============================================================

const STRATEGY_TOOL_SCHEMA = {
  type: "object",
  properties: {
    vision: {
      type: "object",
      properties: {
        ten_year_scene: { type: "string", description: "10 年後的場景，150 字內" },
        core_capabilities: { type: "string", description: "我們有的核心能力（1-3 個）" },
        problem_solved: { type: "string", description: "要解決的具體問題" },
        impact_target: { type: "string", description: "影響的對象/產業/方向" },
      },
      required: ["ten_year_scene", "core_capabilities", "problem_solved", "impact_target"],
    },
    environment: {
      type: "object",
      properties: {
        pestel: {
          type: "object",
          properties: {
            political:     { type: "object", properties: { factor: { type: "string" }, impact: { type: "string", enum: ["low", "medium", "high"] } }, required: ["factor", "impact"] },
            economic:      { type: "object", properties: { factor: { type: "string" }, impact: { type: "string", enum: ["low", "medium", "high"] } }, required: ["factor", "impact"] },
            social:        { type: "object", properties: { factor: { type: "string" }, impact: { type: "string", enum: ["low", "medium", "high"] } }, required: ["factor", "impact"] },
            technological: { type: "object", properties: { factor: { type: "string" }, impact: { type: "string", enum: ["low", "medium", "high"] } }, required: ["factor", "impact"] },
            environmental: { type: "object", properties: { factor: { type: "string" }, impact: { type: "string", enum: ["low", "medium", "high"] } }, required: ["factor", "impact"] },
            legal:         { type: "object", properties: { factor: { type: "string" }, impact: { type: "string", enum: ["low", "medium", "high"] } }, required: ["factor", "impact"] },
          },
          required: ["political", "economic", "social", "technological", "environmental", "legal"],
        },
        market: {
          type: "object",
          properties: {
            tam_billion_ntd: { type: "number", description: "總可觸及市場（億 NTD）" },
            sam_billion_ntd: { type: "number", description: "可服務市場（億 NTD）" },
            som_billion_ntd: { type: "number", description: "我們可拿下的市場（億 NTD）" },
            notes: { type: "string", description: "估算依據一行" },
          },
          required: ["tam_billion_ntd", "sam_billion_ntd", "som_billion_ntd", "notes"],
        },
      },
      required: ["pestel", "market"],
    },
    one_pager: {
      type: "object",
      properties: {
        where_we_are:    { type: "string", description: "現況：要引用診斷分數" },
        where_to_go:     { type: "string", description: "3 年目標" },
        how_to_get_there: { type: "string", description: "關鍵路徑（3 步內）" },
        what_to_avoid:   { type: "string", description: "明確不做的事" },
        first_30_days:   { type: "string", description: "30 天內可以開始的具體動作" },
      },
      required: ["where_we_are", "where_to_go", "how_to_get_there", "what_to_avoid", "first_30_days"],
    },
  },
  required: ["vision", "environment", "one_pager"],
};

// =============================================================
// Main handler
// =============================================================

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

    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return jsonResponse({ error: "invalid auth" }, 401);

    const { company_id } = (await req.json()) as ReqPayload;
    if (!company_id) return jsonResponse({ error: "missing company_id" }, 400);

    // Verify ownership
    const { data: company, error: cErr } = await admin
      .from("companies")
      .select("id, name, industry, workspace_id, owner_student_id, students!inner(user_id)")
      .eq("id", company_id)
      .single<{
        id: string; name: string; industry: string | null;
        workspace_id: string; owner_student_id: string;
        students: { user_id: string };
      }>();
    if (cErr || !company) return jsonResponse({ error: "company not found" }, 404);
    if (company.students.user_id !== user.id) return jsonResponse({ error: "not authorized" }, 403);

    // Fetch all module_data for this company
    const { data: rowsRaw } = await admin
      .from("module_data")
      .select("id, module_type, payload, status, completed_at, updated_at")
      .eq("company_id", company_id);
    const rows = (rowsRaw as ModuleRow[] | null) ?? [];

    // Filter out the strategy module itself (we don't want recursion)
    const inputRows = rows.filter((r) => r.module_type !== "strategy");
    const ctx = buildContext(company.name, company.industry, inputRows);

    if (!ANTHROPIC_API_KEY) {
      return jsonResponse({
        error: "ai_not_configured",
        message: "AI 起草尚未啟用：請設定 ANTHROPIC_API_KEY 後重試。或手動填寫 3 個段落並儲存即可。",
      }, 503);
    }

    const systemPrompt = `你是郭哲佑（Yo）的策略教練分身。學員${company.name ? `「${company.name}」` : ""}${company.industry ? `（${company.industry} 產業）` : ""}已完成下列前置診斷。

請依此 context 起草「3 段戰略」：
1) 願景（10 年場景 + 核心能力 + 解決什麼問題 + 影響什麼）
2) 環境（PESTEL 6 維 + 市場規模 TAM/SAM/SOM 估計）
3) 一頁戰略書（現況 / 目標 / 路徑 / 不做 / 30 天起點）

風格守則：
- 「夠好可以動」但「故意留破綻」— 學員看了會想改
- 引用 context 中的具體分數和挑戰（不要泛泛而談）
- 數字要保守區間，估不出來寫「待補充」
- 30 天起點要具體可執行
- 全部繁體中文
- 呼叫 generate_strategy_draft tool 輸出結構化 JSON`;

    const userPrompt = ctx.markdown + "\n\n---\n\n請依 context 起草 3 段戰略。";

    const aiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: [{
          name: "generate_strategy_draft",
          description: "輸出 3 段戰略草稿",
          input_schema: STRATEGY_TOOL_SCHEMA,
        }],
        tool_choice: { type: "tool", name: "generate_strategy_draft" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      return jsonResponse({
        error: "ai_failed",
        message: `Anthropic ${aiResp.status}: ${errText.slice(0, 250)}`,
      }, 502);
    }

    const aiData = await aiResp.json() as { content: { type: string; input?: any }[] };
    const tool = aiData.content?.find((c) => c.type === "tool_use");
    if (!tool?.input) return jsonResponse({ error: "no tool_use in response" }, 502);

    const draftPayload = {
      ...tool.input,
      cross_module_refs: {
        used: ctx.used,
        snapshot_at: new Date().toISOString(),
      },
    };

    // Upsert strategy module_data
    const { data: stratRow, error: upErr } = await admin
      .from("module_data")
      .upsert({
        workspace_id: company.workspace_id,
        company_id: company.id,
        student_id: company.owner_student_id,
        module_type: "strategy",
        payload: draftPayload,
        ai_input: { context_markdown: ctx.markdown, modules_used: ctx.used },
        ai_output: tool.input,
        status: "in_progress",
      }, { onConflict: "company_id,module_type" })
      .select("id")
      .single();

    if (upErr || !stratRow) return jsonResponse({ error: upErr?.message ?? "upsert failed" }, 500);

    // Write module_data_links for provenance
    if (ctx.ids.length > 0) {
      // Clear old links from this strategy first (for re-draft idempotency)
      await admin
        .from("module_data_links")
        .delete()
        .eq("source_module_data_id", stratRow.id)
        .eq("link_type", "context_input");

      await admin.from("module_data_links").insert(
        ctx.ids.map((targetId) => ({
          source_module_data_id: stratRow.id,
          target_module_data_id: targetId,
          link_type: "context_input",
        })),
      );
    }

    return jsonResponse({
      payload: draftPayload,
      cross_module_refs: {
        used: ctx.used,
        module_data_ids: ctx.ids,
      },
      ai_used: true,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: msg }, 500);
  }
});
