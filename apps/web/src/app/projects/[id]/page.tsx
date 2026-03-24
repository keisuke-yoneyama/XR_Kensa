import Link from "next/link";
import { getProjectById } from "@/lib/api/projects";
import { getMemberCountByProjectId } from "@/lib/api/members";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, memberCount] = await Promise.all([
    getProjectById(id),
    getMemberCountByProjectId(id),
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
          <p className="text-sm text-slate-500">バージョン</p>
          <p className="mt-2 text-lg font-semibold">{project.version}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">部材数</p>
          <p className="mt-2 text-lg font-semibold">{memberCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:border-slate-400"
          href={`/projects/${id}/members`}
        >
          メンバー一覧
        </Link>
        <Link
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:border-slate-400"
          href={`/projects/${id}/inspections`}
        >
          検査一覧
        </Link>
      </div>
    </section>
  );
}
