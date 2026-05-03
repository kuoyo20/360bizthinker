import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;

    const finalSlug = slug.trim() || slugify(name);
    if (!finalSlug) {
      setError("請輸入有效的網址代號（英文/數字）");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("workspaces")
      .insert({
        name: name.trim(),
        slug: finalSlug,
        owner_user_id: user.id,
      })
      .select("id")
      .single();

    if (err || !data) {
      setSubmitting(false);
      setError(
        err?.code === "23505"
          ? "這個網址代號已被使用，請換一個。"
          : err?.message ?? "建立失敗，請重試。",
      );
      return;
    }

    navigate("/admin", { replace: true });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            首次設定
          </p>
          <h1 className="font-serif text-3xl">建立你的 workspace</h1>
          <p className="text-sm text-muted-foreground">
            一個 workspace 是你的顧問空間。你可以在這裡開課程、邀學員、管理所有模組。
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium block">
              Workspace 名稱
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(slugify(e.target.value));
              }}
              placeholder="例：kuoyo 顧問"
              className="w-full h-11 px-3 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="text-sm font-medium block">
              網址代號
            </label>
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <span className="px-3 text-sm text-muted-foreground bg-muted/40 h-11 flex items-center border-r border-border">
                /
              </span>
              <input
                id="slug"
                type="text"
                required
                pattern="[a-z0-9-]+"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="kuoyo"
                className="flex-1 h-11 px-3 bg-background focus:outline-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              只能包含小寫字母、數字、連字號。
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {submitting ? "建立中…" : "建立 workspace"}
          </button>
        </form>
      </div>
    </main>
  );
}
