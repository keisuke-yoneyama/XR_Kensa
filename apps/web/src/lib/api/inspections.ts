import { supabase } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Inspection, InspectionResult } from "@/types/inspection";

// Supabase の inspections テーブルの行型（members を JOIN）
type DbInspection = {
  id: string;
  project_id: string;
  member_id: string;
  result: string;
  inspected_at: string;
  created_at: string;
  updated_at: string;
  members: { member_kind: string } | null;
};

function toInspection(row: DbInspection): Inspection {
  return {
    id: row.id,
    projectId: row.project_id,
    memberId: row.member_id,
    memberKind: row.members?.member_kind ?? "other",
    result: row.result as InspectionResult,
    inspectedAt: row.inspected_at,
  };
}

/**
 * @param client - 省略時はブラウザ用クライアントを使用。
 *                 サーバーコンポーネントから呼ぶ場合は createSupabaseServerClient() を渡すこと。
 */
export async function getInspectionsByProjectId(
  projectId: string,
  client: SupabaseClient = supabase,
): Promise<Inspection[]> {
  const { data, error } = await client
    .from("inspections")
    .select("*, members(member_kind)")
    .eq("project_id", projectId)
    .order("inspected_at", { ascending: false });

  if (error) {
    console.error("[getInspectionsByProjectId]", error.message);
    return [];
  }
  return (data ?? []).map(toInspection);
}

export async function getInspectionById(
  id: string,
  client: SupabaseClient = supabase,
): Promise<Inspection | undefined> {
  const { data, error } = await client
    .from("inspections")
    .select("*, members(member_kind)")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return toInspection(data);
}

export async function getInspectionCountByProjectId(
  projectId: string,
  client: SupabaseClient = supabase,
): Promise<number> {
  const { count, error } = await client
    .from("inspections")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) return 0;
  return count ?? 0;
}
