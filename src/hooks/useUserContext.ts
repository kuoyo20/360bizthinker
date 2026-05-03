import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export interface WorkspaceMembership {
  workspace_id: string;
  role: "admin" | "coach" | "student";
  workspaces: {
    id: string;
    slug: string;
    name: string;
    owner_user_id: string;
  };
}

export function useUserContext() {
  const { user, loading: authLoading } = useAuth();

  const query = useQuery({
    queryKey: ["user-context", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WorkspaceMembership[]> => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, role, workspaces(id, slug, name, owner_user_id)")
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as WorkspaceMembership[];
    },
  });

  const memberships = query.data ?? [];
  const activeMembership = memberships[0];

  return {
    user,
    memberships,
    activeMembership,
    activeWorkspace: activeMembership?.workspaces,
    activeRole: activeMembership?.role,
    isAdmin: activeMembership?.role === "admin",
    isCoach:
      activeMembership?.role === "admin" || activeMembership?.role === "coach",
    hasWorkspace: memberships.length > 0,
    loading: authLoading || query.isLoading,
    error: query.error,
  };
}
