import type { SupabaseClient } from "@supabase/supabase-js";

/** GLB を格納する Supabase Storage バケット名 */
export const MODELS_BUCKET = "models";

/**
 * project ID に対応する GLB の署名付き URL を Supabase Storage から取得する。
 *
 * - ファイルのパスは `{project_id}.glb` を想定
 * - ファイルが存在しない場合・Storage エラーの場合は null を返す
 * - URL はサーバー側で発行し、クライアントに渡す（秘密情報を含まない）
 *
 * @param projectId  project の UUID
 * @param client     認証済みの Supabase クライアント（サーバーコンポーネントから渡す）
 * @param expiresIn  URL の有効期限（秒）。デフォルト 3600 = 1時間
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
