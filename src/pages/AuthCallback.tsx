import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stage, setStage] = useState<string>("驗證登入連結…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setError("登入失敗或連結已過期。請回到登入頁重試。");
      return;
    }

    let cancelled = false;

    (async () => {
      setStage("檢查你的工作空間…");

      const { data: memberships, error: memErr } = await supabase
        .from("workspace_members")
        .select("workspace_id, role")
        .limit(1);

      if (cancelled) return;
      if (memErr) {
        setError(`讀取會員資訊失敗：${memErr.message}`);
        return;
      }

      if (memberships && memberships.length > 0) {
        const role = memberships[0].role;
        navigate(role === "student" ? "/home" : "/admin", { replace: true });
        return;
      }

      navigate("/onboarding", { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-3">
        {error ? (
          <>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="text-sm text-primary hover:underline"
            >
              回登入頁
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{stage}</p>
        )}
      </div>
    </main>
  );
}
