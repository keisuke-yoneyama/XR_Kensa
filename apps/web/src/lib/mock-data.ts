import type { Inspection } from "@/types/inspection";
import type { Member } from "@/types/member";
import type { Project } from "@/types/project";

export const mockProjects: Project[] = [
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
  {
    id: "project-004",
    code: "PJ-004",
    name: "Plant D final inspection",
    memberCount: 55,
    inspectedCount: 31,
  }
];

export const mockMembers: Member[] = [
  { id: "member-001", projectId: "project-001", kind: "column", status: "done" },
  { id: "member-002", projectId: "project-001", kind: "beam", status: "in_progress" },
  { id: "member-003", projectId: "project-002", kind: "brace", status: "pending" },
  { id: "member-004", projectId: "project-003", kind: "column", status: "done" },
  { id: "member-005", projectId: "project-004", kind: "beam", status: "pending" }
];

export const mockInspections: Inspection[] = [
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
  {
    id: "inspection-004",
    projectId: "project-003",
    memberId: "member-004",
    result: "ok",
    inspectedAt: "2026-03-16",
  }
];

export function getProjectById(id: string) {
  return mockProjects.find((project) => project.id === id);
}

export function getMembersByProjectId(projectId: string) {
  return mockMembers.filter((member) => member.projectId === projectId);
}

export function getMemberById(id: string) {
  return mockMembers.find((member) => member.id === id);
}

export function getInspectionsByProjectId(projectId: string) {
  return mockInspections.filter((inspection) => inspection.projectId === projectId);
}