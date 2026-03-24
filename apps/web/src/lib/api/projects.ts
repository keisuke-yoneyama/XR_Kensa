import { apiClient } from "@/lib/api/client";
import { mockProjects } from "@/lib/mock-data";
import type { Project } from "@/types/project";

export async function getProjects(): Promise<Project[]> {
  return apiClient(async () => mockProjects);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return apiClient(async () => mockProjects.find((project) => project.id === id));
}
