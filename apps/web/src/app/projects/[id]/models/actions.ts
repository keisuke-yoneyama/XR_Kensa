"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MODELS_BUCKET } from "@/lib/storage/models";

export type UploadModelResult =
  | { success: true }
  | { success: false; error: string };

/**
 * GLB ファイルを Supabase Storage にアップロードし、project_models にレコードを追加する。
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

    if (!file.name.endsWith(".glb")) {
      return { success: false, error: "GLB ファイル（.glb）のみアップロードできます。" };
    }

    const client = await createSupabaseServerClient();
    const storagePath = `${projectId}/${file.name}`;

    // Storage にアップロード
    const { error: uploadError } = await client.storage
      .from(MODELS_BUCKET)
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      return { success: false, error: `アップロード失敗: ${uploadError.message}` };
    }

    // 既存の最大 display_order を取得
    const { data: existing } = await client
      .from("project_models")
      .select("display_order")
      .eq("project_id", projectId)
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.display_order ?? -1) + 1;

    // DB にレコード追加
    const { error: dbError } = await client
      .from("project_models")
      .insert({
        project_id: projectId,
        label,
        storage_path: storagePath,
        display_order: nextOrder,
      });

    if (dbError) {
      // DB 挿入失敗時は Storage のファイルも削除を試みる
      await client.storage.from(MODELS_BUCKET).remove([storagePath]);
      return { success: false, error: `DB 登録失敗: ${dbError.message}` };
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
 * project_models のレコードと Storage ファイルを削除する。
 */
export async function deleteModel(
  modelId: string,
  projectId: string,
): Promise<UploadModelResult> {
  try {
    const client = await createSupabaseServerClient();

    // 削除対象の storage_path を取得
    const { data: model, error: fetchError } = await client
      .from("project_models")
      .select("storage_path")
      .eq("id", modelId)
      .single();

    if (fetchError || !model) {
      return { success: false, error: "モデルが見つかりません。" };
    }

    // Storage からファイル削除
    await client.storage.from(MODELS_BUCKET).remove([model.storage_path]);

    // DB レコード削除
    const { error: dbError } = await client
      .from("project_models")
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
