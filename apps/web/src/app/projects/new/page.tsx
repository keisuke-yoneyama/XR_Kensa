"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("active");
  const [version, setVersion] = useState("1.0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("工事名と工事コードは必須です。");
      return;
    }
    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("ログインが必要です。再度ログインしてください。");
      setSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase.from("projects").insert({
      project_name: name.trim(),
      project_code: code.trim(),
      status,
      version: version.trim() || "1.0",
      owner_user_id: user.id,
    });

    if (dbError) {
      setError(dbError.message);
      setSubmitting(false);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  return (
    <section className="max-w-lg space-y-6">
      <Link className="inline-flex text-sm font-medium" href="/projects">
        ← プロジェクト一覧
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">New project</p>
        <h1 className="text-3xl font-semibold">新規工事登録</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            工事名 <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="例: A工場 鉄骨建方検査"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            工事コード <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="例: PJ-005"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ステータス</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">下書き</option>
            <option value="active">進行中</option>
            <option value="on_hold">保留</option>
            <option value="completed">完了</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">バージョン</label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="1.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
          <Link
            href="/projects"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </section>
  );
}
