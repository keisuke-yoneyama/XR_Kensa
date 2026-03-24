import Link from "next/link";
import { getProjectById } from "@/lib/api/projects";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <section className="space-y-4">
        <Link className="inline-flex text-sm font-medium" href="/projects">
          ← プロジェクト一覧
        </Link>
        <p className="text-slate-600">プロジェクトが見つかりません（ID: {id}）</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link className="inline-flex text-sm font-medium" href="/projects">
        ← プロジェクト一覧
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">Project detail</p>
        <h1 className="text-3xl font-semibold">{project.name}</h1>
        <p className="text-sm text-slate-600">Project ID: {id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Project code</p>
          <p className="mt-2 text-lg font-semibold">{project.code}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Members</p>
          <p className="mt-2 text-lg font-semibold">{project.memberCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inspected</p>
          <p className="mt-2 text-lg font-semibold">{project.inspectedCount}</p>
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
