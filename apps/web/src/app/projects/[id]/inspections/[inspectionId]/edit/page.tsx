"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatMemberKind } from "@/lib/formatters";

export default function EditInspectionPage() {
  const params = useParams<{ id: string; inspectionId: string }>();
  const projectId = params.id;
  const inspectionId = params.inspectionId;
  const router = useRouter();

  const [result, setResult] = useState("ok");
  const [inspectedAt, setInspectedAt] = useState("");
  const [memberKind, setMemberKind] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("inspections")
      .select("result, inspected_at, members(member_kind)")
      .eq("id", inspectionId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("検査記録が見つかりません。");
        } else {
          setResult(data.result);
          setInspectedAt(data.inspected_at);
          const members = data.members as { member_kind: string } | null;
          setMemberKind(members?.member_kind ?? "");
        }
        setLoading(false);
      });
  }, [inspectionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase
      .from("inspections")
      .update({ result, inspected_at: inspectedAt })
      .eq("id", inspectionId);

    if (dbError) {
      setError(dbError.message);
      setSubmitting(false);
      return;
    }

    router.push(`/projects/${projectId}/inspections`);
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-slate-500">読み込み中...</p>;
  }

  return (
    <section className="max-w-lg space-y-6">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${projectId}/inspections`}>
        ← 検査一覧
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">Edit inspection</p>
        <h1 className="text-3xl font-semibold">検査記録を編集</h1>
        {memberKind && (
          <p className="text-sm text-slate-500">対象部材: {formatMemberKind(memberKind)}</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">検査結果</label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          >
            <option value="ok">合格</option>
            <option value="ng">不合格</option>
            <option value="recheck">再検査</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">検査日</label>
          <input
            type="date"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={inspectedAt}
            onChange={(e) => setInspectedAt(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white hover:bg-steel-800 disabled:opacity-50"
          >
            {submitting ? "更新中..." : "更新する"}
          </button>
          <Link
            href={`/projects/${projectId}/inspections`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </section>
  );
}
