import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  AssessmentChallenge,
  AssessmentPayload,
  AssessmentQuestion,
} from "@/lib/assessment";

export function useAssessmentQuestions() {
  return useQuery({
    queryKey: ["assessment-questions"],
    staleTime: 60 * 60 * 1000, // 1 hour
    queryFn: async (): Promise<AssessmentQuestion[]> => {
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("id, section, text, display_order")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AssessmentQuestion[];
    },
  });
}

export function useAssessmentChallenges() {
  return useQuery({
    queryKey: ["assessment-challenges"],
    staleTime: 60 * 60 * 1000,
    queryFn: async (): Promise<AssessmentChallenge[]> => {
      const { data, error } = await supabase
        .from("assessment_challenges")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AssessmentChallenge[];
    },
  });
}

export function useAssessmentResult(companyId: string | undefined) {
  return useQuery({
    queryKey: ["assessment-result", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("module_data")
        .select("payload, status, completed_at, updated_at")
        .eq("company_id", companyId!)
        .eq("module_type", "assessment")
        .maybeSingle();
      return data as
        | {
            payload: AssessmentPayload;
            status: string;
            completed_at: string | null;
            updated_at: string;
          }
        | null;
    },
  });
}
