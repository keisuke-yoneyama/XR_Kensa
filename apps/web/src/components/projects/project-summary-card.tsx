import Link from "next/link";
import type { Project } from "@/types/project";
import { formatProgress } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";

export function ProjectSummaryCard({ project }: { project: Project }) {
  return (
    <Link
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm no-underline transition hover:border-steel-300 hover:shadow-md"
      href={ROUTES.projectDetail(project.id)}
    >
      <article>
        <p className="text-xs font-medium uppercase tracking-wide text-steel-700">{project.code}</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{project.name}</h3>
        <p className="mt-2 text-sm text-slate-600">Progress: {formatProgress(project.inspectedCount, project.memberCount)}</p>
        <p className="mt-4 text-sm font-medium text-steel-700">View details</p>
      </article>
    </Link>
  );
}