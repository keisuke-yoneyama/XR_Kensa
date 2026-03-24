"use client";

import Link from "next/link";
import { useState } from "react";
import { createUser } from "./actions";

export default function NewUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await createUser(email, password, displayName);

    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(`${result.email} を登録しました。このアカウントで /login からログインできます。`);
      setEmail("");
      setPassword("");
      setDisplayName("");
    }
    setSubmitting(false);
  }

  return (
    <section className="max-w-lg space-y-6">
      <Link className="inline-flex text-sm font-medium" href="/projects">
        ← プロジェクト一覧
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-steel-500">Admin</p>
        <h1 className="text-3xl font-semibold">ユーザー登録</h1>
        <p className="text-sm text-slate-500">
          新しい利用者のアカウントを作成します。登録後すぐにログインできます。
        </p>
      </div>

      {success && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-steel-500 focus:outline-none"
            placeholder="user@example.com"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            パスワード <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-steel-500 focus:outline-none"
            placeholder="6文字以上"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            表示名（任意）
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-steel-500 focus:outline-none"
            placeholder="例: 山田 太郎"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white hover:bg-steel-800 disabled:opacity-50"
        >
          {submitting ? "登録中..." : "登録する"}
        </button>
      </form>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        ⚠️ このページは管理用です。現時点ではログイン済みユーザーなら誰でもアクセスできます。
        管理者専用に制限する場合はロール管理の実装が必要です（フェーズ3以降）。
      </p>
    </section>
  );
}
