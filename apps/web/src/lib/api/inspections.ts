import { supabase } from "@/lib/supabase/client";
import type { Inspection, InspectionResult } from "@/types/inspection";

// Supabase の inspections テーブルの行型
type DbInspection = {
  id: string;
  project_id: string;
  member_id: string;
  result: string;
  inspected_at: string;
  created_at: string;
  updated_at: string;
};

function toInspection(row: DbInspection): Inspection {
  return {
    id: row.id,
    projectId: row.project_id,
    memberId: row.member_id,
    result: row.result as InspectionResult,
    inspectedAt: row.inspected_at,
  };
}

export async function getInspectionsByProjectId(projectId: string): Promise<Inspection[]> {
  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .eq("project_id", projectId)
    .order("inspected_at", { ascending: false });

  if (error) {
    console.error("[getInspectionsByProjectId]", error.message);
    return [];
  }
  return (data ?? []).map(toInspection);
}

export async function getInspectionCountByProjectId(projectId: string): Promise<number> {
  const { count, error } = await supabase
    .from("inspections")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (error) return 0;
  return count ?? 0;
}
