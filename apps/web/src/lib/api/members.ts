import { apiClient } from "@/lib/api/client";
import { mockMembers } from "@/lib/mock-data";
import type { Member } from "@/types/member";

export async function getMembersByProjectId(projectId: string): Promise<Member[]> {
  return apiClient(async () => mockMembers.filter((member) => member.projectId === projectId));
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  return apiClient(async () => mockMembers.find((member) => member.id === id));
}
