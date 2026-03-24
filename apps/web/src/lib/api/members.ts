import { supabase } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
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

/**
 * @param client - 省略時はブラウザ用クライアントを使用。
 *                 サーバーコンポーネントから呼ぶ場合は createSupabaseServerClient() を渡すこと。
 */
export async function getMembersByProjectId(
  projectId: string,
  client: SupabaseClient = supabase,
): Promise<Member[]> {
  const { data, error } = await client
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

export async function getMemberById(
  id: string,
  client: SupabaseClient = supabase,
): Promise<Member | undefined> {
  const { data, error } = await client
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return toMember(data);
}

export async function getMemberCountByProjectId(
  projectId: string,
  client: SupabaseClient = supabase,
): Promise<number> {
  const { count, error } = await client
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) return 0;
  return count ?? 0;
}
