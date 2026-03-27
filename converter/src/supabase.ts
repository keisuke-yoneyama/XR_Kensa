import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です");
}

/** service_role キーを使用する管理者クライアント（RLSバイパス） */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const MODELS_BUCKET = "models";

/**
 * Supabase Storage からファイルをダウンロードしてローカルに保存する。
 */
export async function downloadFromStorage(
  storagePath: string,
  localPath: string,
): Promise<void> {
  const { data, error } = await supabaseAdmin.storage
    .from(MODELS_BUCKET)
    .download(storagePath);

  if (error) {
    throw new Error(`Storage ダウンロード失敗: ${error.message}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  fs.writeFileSync(localPath, buffer);
}

/**
 * ローカルファイルを Supabase Storage にアップロードする。
 */
export async function uploadToStorage(
  localPath: string,
  storagePath: string,
): Promise<number> {
  const fileBuffer = fs.readFileSync(localPath);

  const { error } = await supabaseAdmin.storage
    .from(MODELS_BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: "model/gltf-binary",
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage アップロード失敗: ${error.message}`);
  }

  return fileBuffer.length;
}

/**
 * model_assets の conversion_status を更新する。
 */
export async function updateAssetStatus(
  assetId: string,
  status: "converting" | "completed" | "failed",
  extra: {
    glbPath?: string;
    glbSizeBytes?: number;
    conversionError?: string;
  } = {},
): Promise<void> {
  const updateData: Record<string, unknown> = {
    conversion_status: status,
    updated_at: new Date().toISOString(),
  };

  if (extra.glbPath !== undefined) updateData.glb_path = extra.glbPath;
  if (extra.glbSizeBytes !== undefined) updateData.glb_size_bytes = extra.glbSizeBytes;
  if (extra.conversionError !== undefined) updateData.conversion_error = extra.conversionError;

  const { error } = await supabaseAdmin
    .from("model_assets")
    .update(updateData)
    .eq("id", assetId);

  if (error) {
    console.error(`[updateAssetStatus] DB更新失敗: ${error.message}`);
  }
}
