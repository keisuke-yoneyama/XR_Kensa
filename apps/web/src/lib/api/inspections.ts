import { apiClient } from "@/lib/api/client";
import { mockInspections } from "@/lib/mock-data";
import type { Inspection } from "@/types/inspection";

export async function getInspectionsByProjectId(projectId: string): Promise<Inspection[]> {
  return apiClient(async () => mockInspections.filter((inspection) => inspection.projectId === projectId));
}
