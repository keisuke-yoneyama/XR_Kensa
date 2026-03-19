export type MemberStatus = "pending" | "in_progress" | "done";

export type Member = {
  id: string;
  projectId: string;
  kind: string;
  status: MemberStatus;
};