import { supabase } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModelEntry } from "@/lib/model-paths";

/** GLB を格納する Supabase Storage バケット名 */
export const MODELS_BUCKET = "models";

// ---------------------------------------------------------------------------
// DB 行型
// ---------------------------------------------------------------------------

type DbProjectModel = {
  id: string;
  project_id: string;
  label: string;
  storage_path: string;
  display_order: number;
  created_at: string;
};

/** アプリ内で扱う ProjectModel 型 */
export type ProjectModel = {
  id: string;
  projectId: string;
  label: string;
  storagePath: string;
  displayOrder: number;
};

function toProjectModel(row: DbProjectModel): ProjectModel {
  return {
    id: row.id,
    projectId: row.project_id,
    label: row.label,
    storagePath: row.storage_path,
    displayOrder: row.display_order,
  };
}

// ---------------------------------------------------------------------------
// DB 取得
// ---------------------------------------------------------------------------

/**
 * project_models テーブルから指定プロジェクトのモデル一覧を取得する。
 *
 * @param client - サーバーコンポーネントから呼ぶ場合は createSupabaseServerClient() を渡すこと。
 */
export async function getProjectModels(
  projectId: string,
  client: SupabaseClient = supabase,
): Promise<ProjectModel[]> {
  const { data, error } = await client
    .from("project_models")
    .select("*")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getProjectModels]", error.message);
    return [];
  }
  return (data ?? []).map(toProjectModel);
}

// ---------------------------------------------------------------------------
// 署名付き URL 生成
// ---------------------------------------------------------------------------

/**
 * ProjectModel[] から ModelEntry[]（label + 署名付き URL）を生成する。
 * 署名付き URL の取得に失敗したモデルはスキップされる。
 *
 * @param expiresIn URL の有効期限（秒）。デフォルト 3600 = 1時間
 */
export async function getSignedModelEntries(
  models: ProjectModel[],
  client: SupabaseClient,
  expiresIn = 3600,
): Promise<ModelEntry[]> {
  const entries: ModelEntry[] = [];

  for (const model of models) {
    const { data, error } = await client.storage
      .from(MODELS_BUCKET)
      .createSignedUrl(model.storagePath, expiresIn);

    if (error) {
      console.warn(
        `[getSignedModelEntries] ${model.storagePath}: ${error.message}`,
      );
      continue;
    }
    entries.push({ label: model.label, path: data.signedUrl });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// レガシー: 単一ファイル用ヘルパー（互換性のため残す）
// ---------------------------------------------------------------------------

/**
 * project ID に対応する GLB の署名付き URL を Supabase Storage から取得する。
 *
 * - ファイルのパスは `{project_id}.glb` を想定
 * - ファイルが存在しない場合・Storage エラーの場合は null を返す
 * - URL はサーバー側で発行し、クライアントに渡す（秘密情報を含まない）
 *
 * @deprecated getProjectModels + getSignedModelEntries を使用してください
 */
export async function getStorageModelUrl(
  projectId: string,
  client: SupabaseClient,
  expiresIn = 3600,
): Promise<string | null> {
  const path = `${projectId}.glb`;

  const { data, error } = await client.storage
    .from(MODELS_BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    // ファイル未登録は通常運用内なので warn 止まり
    console.warn(`[getStorageModelUrl] ${projectId}: ${error.message}`);
    return null;
  }

  return data.signedUrl;
}
