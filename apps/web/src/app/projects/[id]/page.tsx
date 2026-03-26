import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/api/projects";
import { getMemberCountByProjectId } from "@/lib/api/members";
import { getInspectionCountByProjectId } from "@/lib/api/inspections";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await createSupabaseServerClient();
  const [project, memberCount, inspectionCount] = await Promise.all([
    getProjectById(id, client),
    getMemberCountByProjectId(id, client),
    getInspectionCountByProjectId(id, client),
  ]);

  if (!project) {
    return (
      <section className="space-y-4">
        <Link className="inline-flex text-sm font-medium" href="/projects">
          ← 工事一覧
        </Link>
        <p className="text-slate-600">プロジェクトが見つかりません（ID: {id}）</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link className="inline-flex text-sm font-medium" href="/projects">
        ← 工事一覧
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">Project detail</p>
        <h1 className="text-3xl font-semibold">{project.name}</h1>
        <p className="text-sm text-slate-600">ID: {id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">工事コード</p>
          <p className="mt-2 text-lg font-semibold">{project.code}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">ステータス</p>
          <p className="mt-2 text-lg font-semibold">{project.status}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">部材数</p>
          <p className="mt-2 text-lg font-semibold">{memberCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">検査件数</p>
          <p className="mt-2 text-lg font-semibold">{inspectionCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:border-slate-400"
          href={`/projects/${id}/members`}
        >
          部材一覧
        </Link>
        <Link
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:border-slate-400"
          href={`/projects/${id}/inspections`}
        >
          検査一覧
        </Link>
        <Link
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:border-slate-400"
          href={`/projects/${id}/models`}
        >
          モデル管理
        </Link>
        <Link
          className="rounded-lg border border-steel-500 bg-steel-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-steel-700"
          href={`/projects/${id}/viewer`}
        >
          3D モデルを見る
        </Link>
      </div>
    </section>
  );
}
