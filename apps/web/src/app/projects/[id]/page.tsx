import Link from "next/link";
import { getProjectById } from "@/lib/api/projects";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  return (
    <section className="space-y-6">
      <Link className="inline-flex text-sm font-medium" href="/projects">
        Back to projects
      </Link>

      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">Project detail</p>
        <h1 className="text-3xl font-semibold">{project?.name ?? "Project not found"}</h1>
        <p className="text-sm text-slate-600">Project ID: {id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Project code</p>
          <p className="mt-2 text-lg font-semibold">{project?.code ?? "-"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Members</p>
          <p className="mt-2 text-lg font-semibold">{project?.memberCount ?? 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inspected</p>
          <p className="mt-2 text-lg font-semibold">{project?.inspectedCount ?? 0}</p>
        </div>
      </div>
    </section>
  );
}