"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません。");
    } else {
      router.push("/projects");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-steel-500">
          steel-mr-inspection
        </p>
        <h2 className="text-2xl font-semibold text-slate-900">ログイン</h2>
        <p className="text-sm text-slate-600">
          メールアドレスとパスワードを入力してください。
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            メールアドレス
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-steel-500 focus:outline-none"
            placeholder="user@example.com"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            パスワード
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-steel-500 focus:outline-none"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white hover:bg-steel-800 disabled:opacity-50"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </section>
  );
}
