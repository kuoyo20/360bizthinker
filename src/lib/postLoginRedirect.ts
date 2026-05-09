import { supabase } from "./supabase";

export type PostLoginRoute = "/home" | "/admin" | "/onboarding";

/**
 * Decide where a freshly-authenticated user should land:
 * - has workspace membership as student → /home
 * - has workspace membership (any other role) → /admin
 * - no membership yet → /onboarding (workspace bootstrap)
 *
 * Returns null if reading memberships fails — caller should surface the error.
 */
export async function resolvePostLoginRoute(): Promise<{
  route: PostLoginRoute | null;
  error: string | null;
}> {
  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .limit(1);

  if (error) {
    return { route: null, error: `讀取會員資訊失敗：${error.message}` };
  }

  if (memberships && memberships.length > 0) {
    const role = memberships[0].role;
    return {
      route: role === "student" ? "/home" : "/admin",
      error: null,
    };
  }

  return { route: "/onboarding", error: null };
}
