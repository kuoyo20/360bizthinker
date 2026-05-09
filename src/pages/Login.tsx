import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { requestEmailOtp, verifyEmailOtp } from "@/lib/auth";
import { resolvePostLoginRoute } from "@/lib/postLoginRedirect";

type Stage = "email" | "code";
type Status = "idle" | "submitting" | "error";

export default function Login() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSendCode(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    setError(null);
    const { error: err } = await requestEmailOtp(email.trim());
    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    setStatus("idle");
    setStage("code");
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError("請輸入 6 碼數字");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError(null);
    const { error: err } = await verifyEmailOtp(email.trim(), trimmed);
    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }

    const { route, error: routeErr } = await resolvePostLoginRoute();
    if (routeErr || !route) {
      setStatus("error");
      setError(routeErr ?? "登入後找不到目的地，請重試");
      return;
    }
    navigate(route, { replace: true });
  }

  function resetToEmail() {
    setStage("email");
    setCode("");
    setStatus("idle");
    setError(null);
  }

  async function resendCode() {
    setStatus("submitting");
    setError(null);
    const { error: err } = await requestEmailOtp(email.trim());
    if (err) {
      setStatus("error");
      setError(err.message);
      return;
    }
    setStatus("idle");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition"
          >
            ← 360bizthinker
          </Link>
          <h1 className="font-serif text-3xl">登入 / 註冊</h1>
          <p className="text-sm text-muted-foreground">
            {stage === "email"
              ? "輸入 email，我們會寄一組 6 碼登入碼給你。沒有帳號的話會自動建立。"
              : "請查收 email，將信中的 6 碼數字填入下方。"}
          </p>
        </div>

        {stage === "email" ? (
          <form onSubmit={onSendCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium block">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={status === "submitting"}
                className="w-full h-11 px-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "submitting" ? "寄送中…" : "寄出 6 碼登入碼"}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              第一次來？直接輸入 email 即可，系統自動建立帳號。
            </p>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <div className="border border-border rounded-md p-4 bg-muted/30 text-sm">
              <p className="font-medium">📬 已寄出登入碼</p>
              <p className="text-muted-foreground">
                收件人：<strong>{email}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium block">
                6 碼登入碼
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                disabled={status === "submitting"}
                autoFocus
                className="w-full h-12 px-3 border border-border rounded-md bg-background text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting" || code.length !== 6}
              className="w-full h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {status === "submitting" ? "驗證中…" : "登入"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={resetToEmail}
                className="text-muted-foreground hover:text-foreground transition"
              >
                ← 改用其他 email
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={status === "submitting"}
                className="text-primary hover:underline disabled:opacity-60"
              >
                沒收到？重寄
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
