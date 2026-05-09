import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { resolvePostLoginRoute } from "@/lib/postLoginRedirect";

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
      const { route, error: routeErr } = await resolvePostLoginRoute();
      if (cancelled) return;
      if (routeErr || !route) {
        setError(routeErr ?? "登入後找不到目的地，請重試");
        return;
      }
      navigate(route, { replace: true });
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
