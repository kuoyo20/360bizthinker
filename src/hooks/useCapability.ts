import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CapabilityPayload } from "@/lib/capability";

export function useCapabilityData(companyId: string | undefined) {
  return useQuery({
    queryKey: ["capability", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("module_data")
        .select("payload, status, completed_at, updated_at")
        .eq("company_id", companyId!)
        .eq("module_type", "capability_eval")
        .maybeSingle();
      if (error) throw error;
      return data as
        | {
            payload: CapabilityPayload;
            status: string;
            completed_at: string | null;
            updated_at: string;
          }
        | null;
    },
  });
}

export function useSaveCapability(companyId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      payload,
      status,
    }: {
      payload: CapabilityPayload;
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
      if (!student || !company) throw new Error("找不到 student / company");

      const { error } = await supabase.from("module_data").upsert(
        {
          workspace_id: company.workspace_id,
          company_id: companyId,
          student_id: student.id,
          module_type: "capability_eval",
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
      qc.invalidateQueries({ queryKey: ["capability", companyId] });
      qc.invalidateQueries({ queryKey: ["company-modules", companyId] });
    },
  });
}
