import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

interface SyncPayload {
  company_id: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BRAND_OS_URL = Deno.env.get("BRAND_OS_SUPABASE_URL");
const BRAND_OS_KEY = Deno.env.get("BRAND_OS_SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "missing auth" }, 401);

    if (!BRAND_OS_URL || !BRAND_OS_KEY) {
      return jsonResponse(
        {
          error: "brand_os_not_configured",
          message:
            "Brand OS 同步尚未啟用。請 kuoyo 到 Supabase Edge Function Secrets 加上 BRAND_OS_SUPABASE_URL 和 BRAND_OS_SUPABASE_SERVICE_ROLE_KEY 兩個祕密值。",
        },
        503,
      );
    }

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const brandOS = createClient(BRAND_OS_URL, BRAND_OS_KEY);

    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();
    if (authErr || !user || !user.email) {
      return jsonResponse({ error: "invalid auth" }, 401);
    }

    const { company_id } = (await req.json()) as SyncPayload;
    if (!company_id) return jsonResponse({ error: "missing company_id" }, 400);

    // Fetch company + verify ownership
    const { data: company, error: cErr } = await admin
      .from("companies")
      .select(
        "id, name, workspace_id, owner_student_id, students!inner(user_id)",
      )
      .eq("id", company_id)
      .single<{
        id: string;
        name: string;
        workspace_id: string;
        owner_student_id: string;
        students: { user_id: string };
      }>();
    if (cErr || !company) {
      return jsonResponse({ error: "company not found" }, 404);
    }
    if (company.students.user_id !== user.id) {
      return jsonResponse({ error: "not authorized" }, 403);
    }

    // Find Brand OS user by email
    const { data: bUsersResp, error: bUsersErr } = await brandOS.auth.admin
      .listUsers({ page: 1, perPage: 1000 });
    if (bUsersErr) {
      return jsonResponse(
        { error: "brand_os_unreachable", message: bUsersErr.message },
        502,
      );
    }
    const brandOSUser = bUsersResp.users.find(
      (u) => u.email?.toLowerCase() === user.email!.toLowerCase(),
    );
    if (!brandOSUser) {
      return jsonResponse(
        {
          error: "no_brand_os_account",
          message: `Brand OS 找不到 ${user.email} 的帳號。請到 https://consumer-insight-map.vercel.app 用同一個 email 註冊一次。`,
        },
        404,
      );
    }

    // Find brand by name (case-insensitive)
    const { data: brands, error: bErr } = await brandOS
      .from("brands")
      .select("id, name, industry, product")
      .eq("user_id", brandOSUser.id)
      .ilike("name", company.name);
    if (bErr) return jsonResponse({ error: bErr.message }, 500);
    if (!brands || brands.length === 0) {
      return jsonResponse(
        {
          error: "no_matching_brand",
          message: `Brand OS 中找不到名為「${company.name}」的品牌。請在 Brand OS 用一模一樣的名字建立品牌（大小寫不分）。`,
        },
        404,
      );
    }
    const brand = brands[0];

    const [pyramidRes, soulRes, empathyRes] = await Promise.all([
      brandOS.from("brand_pyramid").select("*").eq("brand_id", brand.id).maybeSingle(),
      brandOS.from("brand_soul_results").select("*").eq("brand_id", brand.id).maybeSingle(),
      brandOS.from("empathy_results").select("*").eq("brand_id", brand.id).maybeSingle(),
    ]);

    const synced_pyramid = pyramidRes.data ?? null;
    const synced_soul = soulRes.data ?? null;
    const synced_empathy = empathyRes.data ?? null;
    const allDone = !!synced_pyramid && !!synced_soul && !!synced_empathy;

    const payload = {
      external_url: `https://consumer-insight-map.vercel.app/brands/${brand.id}`,
      brand_id: brand.id,
      brand_name: brand.name,
      synced_pyramid,
      synced_soul,
      synced_empathy,
      last_synced_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await admin.from("module_data").upsert(
      {
        workspace_id: company.workspace_id,
        company_id: company.id,
        student_id: company.owner_student_id,
        module_type: "brand_os",
        payload,
        status: allDone ? "completed" : synced_pyramid ? "in_progress" : "draft",
        completed_at: allDone ? new Date().toISOString() : null,
      },
      { onConflict: "company_id,module_type" },
    );
    if (upsertErr) return jsonResponse({ error: upsertErr.message }, 500);

    return jsonResponse({
      success: true,
      synced: {
        pyramid: !!synced_pyramid,
        soul: !!synced_soul,
        empathy: !!synced_empathy,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonResponse({ error: msg }, 500);
  }
});
