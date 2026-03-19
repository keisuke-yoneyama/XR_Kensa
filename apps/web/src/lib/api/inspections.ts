import { apiClient } from "@/lib/api/client";
import type { Inspection } from "@/types/inspection";

const mockInspections: Inspection[] = [
  {
    id: "inspection-001",
    projectId: "project-001",
    memberId: "member-001",
    result: "ok",
    inspectedAt: "2026-03-19",
  },
  {
    id: "inspection-002",
    projectId: "project-001",
    memberId: "member-002",
    result: "recheck",
    inspectedAt: "2026-03-18",
  },
  {
    id: "inspection-003",
    projectId: "project-002",
    memberId: "member-003",
    result: "ng",
    inspectedAt: "2026-03-17",
  },
];

export async function getInspectionsByProjectId(projectId: string): Promise<Inspection[]> {
  return apiClient(async () => mockInspections.filter((inspection) => inspection.projectId === projectId));
}