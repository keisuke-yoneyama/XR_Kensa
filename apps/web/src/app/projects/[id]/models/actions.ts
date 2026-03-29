"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MODELS_BUCKET } from "@/lib/storage/model-assets";

export type UploadModelResult =
  | { success: true }
  | { success: false; error: string };

/**
 * GLB または IFC ファイルをアップロードし、model_assets にレコードを追加する。
 * - GLB: Storage に直接保存し、conversion_status = 'direct'
 * - IFC: Storage に保存し、conversion_status = 'pending'。変換は converter サービスが行う。
 */
export async function uploadModel(
  formData: FormData,
): Promise<UploadModelResult> {
  try {
    const projectId = formData.get("projectId") as string;
    const label = (formData.get("label") as string)?.trim();
    const file = formData.get("file") as File | null;

    if (!projectId || !label || !file || file.size === 0) {
      return { success: false, error: "プロジェクトID、ラベル、ファイルは必須です。" };
    }

    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (ext !== "glb" && ext !== "ifc") {
      return { success: false, error: "GLB（.glb）または IFC（.ifc）ファイルのみアップロードできます。" };
    }

    const client = await createSupabaseServerClient();
    const isIfc = ext === "ifc";

    // Storage パス: {projectId}/glb/{uuid}.ext or {projectId}/ifc/{uuid}.ext
    // 日本語など非ASCII文字を含むファイル名はSupabase Storageで使えないためUUIDに置換
    const subDir = isIfc ? "ifc" : "glb";
    const safeFileName = `${randomUUID()}.${ext}`;
    const storagePath = `${projectId}/${subDir}/${safeFileName}`;

    // Storage にアップロード
    const { error: uploadError } = await client.storage
      .from(MODELS_BUCKET)
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      return { success: false, error: `アップロード失敗: ${uploadError.message}` };
    }

    // 既存の最大 display_order を取得
    const { data: existing } = await client
      .from("model_assets")
      .select("display_order")
      .eq("project_id", projectId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;

    // DB にレコード追加
    const insertData = {
      project_id: projectId,
      label,
      glb_path: isIfc ? null : storagePath,
      ifc_path: isIfc ? storagePath : null,
      original_filename: fileName,
      file_size_bytes: file.size,
      glb_size_bytes: isIfc ? null : file.size,
      conversion_status: isIfc ? "pending" : "direct",
      display_order: nextOrder,
    };

    const { data: insertedRow, error: dbError } = await client
      .from("model_assets")
      .insert(insertData)
      .select("id")
      .single();

    if (dbError) {
      // DB 挿入失敗時は Storage のファイルも削除を試みる
      await client.storage.from(MODELS_BUCKET).remove([storagePath]);
      return { success: false, error: `DB 登録失敗: ${dbError.message}` };
    }

    // IFC の場合は converter サービスに変換リクエストを送信
    if (isIfc && insertedRow) {
      try {
        const { triggerConversion } = await import("@/lib/api/converter");
        await triggerConversion({
          assetId: insertedRow.id,
          projectId,
          ifcPath: storagePath,
        });
      } catch (convErr) {
        // 変換リクエスト失敗は致命的ではない（後でリトライ可能）
        console.error("[uploadModel] converter 呼出し失敗:", convErr);
      }
    }

    revalidatePath(`/projects/${projectId}/viewer`);
    revalidatePath(`/projects/${projectId}/models`);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "予期しないエラーが発生しました。";
    return { success: false, error: message };
  }
}

/**
 * model_assets のレコードと Storage ファイルを削除する。
 */
export async function deleteModel(
  modelId: string,
  projectId: string,
): Promise<UploadModelResult> {
  try {
    const client = await createSupabaseServerClient();

    // 削除対象のパスを取得
    const { data: asset, error: fetchError } = await client
      .from("model_assets")
      .select("glb_path, ifc_path")
      .eq("id", modelId)
      .single();

    if (fetchError || !asset) {
      return { success: false, error: "モデルが見つかりません。" };
    }

    // Storage からファイル削除（GLB と IFC 両方）
    const pathsToRemove = [asset.glb_path, asset.ifc_path].filter(Boolean) as string[];
    if (pathsToRemove.length > 0) {
      await client.storage.from(MODELS_BUCKET).remove(pathsToRemove);
    }

    // DB レコード削除
    const { error: dbError } = await client
      .from("model_assets")
      .delete()
      .eq("id", modelId);

    if (dbError) {
      return { success: false, error: `削除失敗: ${dbError.message}` };
    }

    revalidatePath(`/projects/${projectId}/viewer`);
    revalidatePath(`/projects/${projectId}/models`);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "予期しないエラーが発生しました。";
    return { success: false, error: message };
  }
}
