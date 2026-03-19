import Link from "next/link";
import { getProjects } from "@/lib/api/projects";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-steel-700">Projects</p>
        <h1 className="text-3xl font-semibold">Project list</h1>
        <p className="text-sm text-slate-600">Mock data only. apps/api is not connected yet.</p>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            className="block rounded-xl border border-slate-200 bg-white p-5 no-underline shadow-sm transition hover:border-steel-300"
            href={`/projects/${project.id}`}
          >
            <p className="text-sm font-medium text-steel-700">{project.code}</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{project.name}</h2>
            <p className="mt-3 text-sm text-slate-600">Members: {project.memberCount}</p>
            <p className="text-sm text-slate-600">Inspected: {project.inspectedCount}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}