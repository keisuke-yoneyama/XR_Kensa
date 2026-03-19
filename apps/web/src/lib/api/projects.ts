import { apiClient } from "@/lib/api/client";
import type { Project } from "@/types/project";

const mockProjects: Project[] = [
  {
    id: "project-001",
    code: "PJ-001",
    name: "Factory A steel inspection",
    memberCount: 42,
    inspectedCount: 18,
  },
  {
    id: "project-002",
    code: "PJ-002",
    name: "Warehouse B frame inspection",
    memberCount: 30,
    inspectedCount: 10,
  },
  {
    id: "project-003",
    code: "PJ-003",
    name: "Office C column check",
    memberCount: 24,
    inspectedCount: 22,
  },
];

export async function getProjects(): Promise<Project[]> {
  return apiClient(async () => mockProjects);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return apiClient(async () => mockProjects.find((project) => project.id === id));
}