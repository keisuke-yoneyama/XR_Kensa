"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NewMemberPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const router = useRouter();

  const [kind, setKind] = useState("column");
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase.from("members").insert({
      project_id: projectId,
      member_kind: kind,
      status,
    });

    if (dbError) {
      setError(dbError.message);
      setSubmitting(false);
      return;
    }

    router.push(`/projects/${projectId}/members`);
    router.refresh();
  }

  return (
    <section className="max-w-lg space-y-6">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${projectId}/members`}>
        ← メンバー一覧
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">New member</p>
        <h1 className="text-3xl font-semibold">部材追加</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            部材種別 <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="column">柱（column）</option>
            <option value="beam">梁（beam）</option>
            <option value="brace">ブレース（brace）</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">検査状況</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pending">未着手</option>
            <option value="in_progress">検査中</option>
            <option value="done">完了</option>
          </select>
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
            {submitting ? "追加中..." : "追加する"}
          </button>
          <Link
            href={`/projects/${projectId}/members`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </section>
  );
}
