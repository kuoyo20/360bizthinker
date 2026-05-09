import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { StrategyPayload } from "@/lib/strategy";

export function useStrategyData(companyId: string | undefined) {
  return useQuery({
    queryKey: ["strategy", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_data")
        .select("payload, status, completed_at, updated_at")
        .eq("company_id", companyId!)
        .eq("module_type", "strategy")
        .maybeSingle();
      if (error) throw error;
      return data as
        | {
            payload: StrategyPayload;
            status: string;
            completed_at: string | null;
            updated_at: string;
          }
        | null;
    },
  });
}

export function useSaveStrategy(companyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payload,
      status,
    }: {
      payload: StrategyPayload;
      status: "draft" | "in_progress" | "completed";
    }) => {
      if (!companyId) throw new Error("missing companyId");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("尚未登入");

      const [{ data: student }, { data: company }] = await Promise.all([
        supabase.from("students").select("id").eq("user_id", user.id).single(),
        supabase
          .from("companies")
          .select("workspace_id")
          .eq("id", companyId)
          .single(),
      ]);
      if (!student || !company) throw new Error("找不到 student/company");

      const { error } = await supabase.from("module_data").upsert(
        {
          workspace_id: company.workspace_id,
          company_id: companyId,
          student_id: student.id,
          module_type: "strategy",
          payload,
          status,
          completed_at:
            status === "completed" ? new Date().toISOString() : null,
        },
        { onConflict: "company_id,module_type" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["strategy", companyId] });
      qc.invalidateQueries({ queryKey: ["company-modules", companyId] });
    },
  });
}

export interface StrategyDraftResult {
  payload: StrategyPayload;
  cross_module_refs: { used: string[]; module_data_ids: string[] };
  ai_used: boolean;
}

export function useGenerateStrategyDraft(companyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<StrategyDraftResult>({
    mutationFn: async () => {
      if (!companyId) throw new Error("missing companyId");
      const { data, error } = await supabase.functions.invoke(
        "generate-strategy-draft",
        { body: { company_id: companyId } },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.message ?? data.error);
      return data as StrategyDraftResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["strategy", companyId] });
      qc.invalidateQueries({ queryKey: ["company-modules", companyId] });
    },
  });
}
