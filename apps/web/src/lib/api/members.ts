import { supabase } from "@/lib/supabase/client";
import type { Member, MemberStatus } from "@/types/member";

// Supabase の members テーブルの行型
type DbMember = {
  id: string;
  project_id: string;
  member_kind: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function toMember(row: DbMember): Member {
  return {
    id: row.id,
    projectId: row.project_id,
    kind: row.member_kind,
    status: row.status as MemberStatus,
  };
}

export async function getMembersByProjectId(projectId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getMembersByProjectId]", error.message);
    return [];
  }
  return (data ?? []).map(toMember);
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return toMember(data);
}

export async function getMemberCountByProjectId(projectId: string): Promise<number> {
  const { count, error } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) return 0;
  return count ?? 0;
}
