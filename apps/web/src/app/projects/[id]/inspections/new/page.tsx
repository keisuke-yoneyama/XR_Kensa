"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatMemberKind } from "@/lib/formatters";

type MemberOption = { id: string; member_kind: string };

export default function NewInspectionPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const router = useRouter();

  const [members, setMembers] = useState<MemberOption[]>([]);
  const [memberId, setMemberId] = useState("");
  const [result, setResult] = useState("ok");
  const [inspectedAt, setInspectedAt] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from("members")
      .select("id, member_kind")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMembers(data);
      });
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) {
      setError("部材を選択してください。");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase.from("inspections").insert({
      project_id: projectId,
      member_id: memberId,
      result,
      inspected_at: inspectedAt,
    });

    if (dbError) {
      setError(dbError.message);
      setSubmitting(false);
      return;
    }

    router.push(`/projects/${projectId}/inspections`);
    router.refresh();
  }

  return (
    <section className="max-w-lg space-y-6">
      <Link className="inline-flex text-sm font-medium" href={`/projects/${projectId}/inspections`}>
        ← 検査一覧
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">New inspection</p>
        <h1 className="text-3xl font-semibold">検査記録追加</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            対象部材 <span className="text-red-500">*</span>
          </label>
          {members.length === 0 ? (
            <p className="text-sm text-slate-500">
              部材が登録されていません。先に部材を追加してください。
            </p>
          ) : (
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            >
              <option value="">-- 部材を選択 --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {formatMemberKind(m.member_kind)}（{m.id.slice(0, 8)}…）
                </option>
              ))}
            </select>
          )}
        </div>

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
            disabled={submitting || members.length === 0}
            className="rounded-lg bg-steel-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "登録中..." : "登録する"}
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
