import { apiClient } from "@/lib/api/client";
import type { Member } from "@/types/member";

const mockMembers: Member[] = [
  { id: "member-001", projectId: "project-001", kind: "column", status: "done" },
  { id: "member-002", projectId: "project-001", kind: "beam", status: "in_progress" },
  { id: "member-003", projectId: "project-002", kind: "brace", status: "pending" },
  { id: "member-004", projectId: "project-003", kind: "column", status: "done" },
];

export async function getMembersByProjectId(projectId: string): Promise<Member[]> {
  return apiClient(async () => mockMembers.filter((member) => member.projectId === projectId));
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  return apiClient(async () => mockMembers.find((member) => member.id === id));
}