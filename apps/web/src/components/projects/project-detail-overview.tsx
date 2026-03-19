import type { Project } from "@/types/project";
import { StatCard } from "@/components/ui/stat-card";

export function ProjectDetailOverview({ project }: { project?: Project }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Project code" value={project?.code ?? "-"} />
      <StatCard label="Members" value={project?.memberCount ?? 0} />
      <StatCard label="Inspected" value={project?.inspectedCount ?? 0} />
    </div>
  );
}