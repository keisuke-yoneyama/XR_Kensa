import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/types/project";

// Supabase の projects テーブルの行型
type DbProject = {
  id: string;
  project_code: string;
  project_name: string;
  status: string;
  version: string;
  created_at: string;
  updated_at: string;
};

function toProject(row: DbProject): Project {
  return {
    id: row.id,
    code: row.project_code,
    name: row.project_name,
    status: row.status,
    version: row.version,
    // members / inspections は今後 DB 化後に集計予定。現在は 0 固定。
    memberCount: 0,
    inspectedCount: 0,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProjects]", error.message);
    return [];
  }
  return (data ?? []).map(toProject);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return undefined;
  return toProject(data);
}
