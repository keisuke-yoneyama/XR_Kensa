import type { Project } from "@/types/project";
import { ProjectSummaryCard } from "@/components/projects/project-summary-card";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((project) => (
        <ProjectSummaryCard key={project.id} project={project} />
      ))}
    </div>
  );
}