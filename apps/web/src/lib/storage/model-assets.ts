import { supabase } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModelEntry } from "@/lib/model-paths";
import type { ModelAsset, ConversionStatus } from "@/types/model-asset";

/** GLB / IFC を格納する Supabase Storage バケット名 */
export const MODELS_BUCKET = "models";

// ---------------------------------------------------------------------------
// DB 行型
// ---------------------------------------------------------------------------

type DbModelAsset = {
  id: string;
  project_id: string;
  label: string;
  glb_path: string | null;
  ifc_path: string | null;
  original_filename: string;
  file_size_bytes: number | null;
  glb_size_bytes: number | null;
  conversion_status: ConversionStatus;
  conversion_error: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

function toModelAsset(row: DbModelAsset): ModelAsset {
  return {
    id: row.id,
    projectId: row.project_id,
    label: row.label,
    glbPath: row.glb_path,
    ifcPath: row.ifc_path,
    originalFilename: row.original_filename,
    fileSizeBytes: row.file_size_bytes,
    glbSizeBytes: row.glb_size_bytes,
    conversionStatus: row.conversion_status,
    conversionError: row.conversion_error,
    displayOrder: row.display_order,
  };
}

// ---------------------------------------------------------------------------
// DB 取得
// ---------------------------------------------------------------------------

/**
 * model_assets テーブルから指定プロジェクトのモデル一覧を取得する。
 *
 * @param client - サーバーコンポーネントから呼ぶ場合は createSupabaseServerClient() を渡すこと。
 */
export async function getModelAssets(
  projectId: string,
  client: SupabaseClient = supabase,
): Promise<ModelAsset[]> {
  const { data, error } = await client
    .from("model_assets")
    .select("*")
    .eq("project_id", projectId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getModelAssets]", error.message);
    return [];
  }
  return (data ?? []).map(toModelAsset);
}

/**
 * model_assets テーブルから単一のモデルアセットを取得する。
 */
export async function getModelAssetById(
  id: string,
  client: SupabaseClient = supabase,
): Promise<ModelAsset | null> {
  const { data, error } = await client
    .from("model_assets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getModelAssetById]", error.message);
    return null;
  }
  return data ? toModelAsset(data) : null;
}

// ---------------------------------------------------------------------------
// 署名付き URL 生成
// ---------------------------------------------------------------------------

/**
 * ModelAsset[] から ModelEntry[]（label + 署名付き URL）を生成する。
 * glb_path が null または conversion_status が completed/direct でないものはスキップ。
 *
 * @param expiresIn URL の有効期限（秒）。デフォルト 3600 = 1時間
 */
export async function getSignedModelAssetEntries(
  assets: ModelAsset[],
  client: SupabaseClient,
  expiresIn = 3600,
): Promise<ModelEntry[]> {
  const entries: ModelEntry[] = [];

  for (const asset of assets) {
    // GLBが利用可能なもののみ
    if (!asset.glbPath) continue;
    if (asset.conversionStatus !== "direct" && asset.conversionStatus !== "completed") continue;

    const { data, error } = await client.storage
      .from(MODELS_BUCKET)
      .createSignedUrl(asset.glbPath, expiresIn);

    if (error) {
      console.warn(
        `[getSignedModelAssetEntries] ${asset.glbPath}: ${error.message}`,
      );
      continue;
    }
    entries.push({ label: asset.label, path: data.signedUrl });
  }

  return entries;
}
