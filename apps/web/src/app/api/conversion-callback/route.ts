import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CONVERTER_API_KEY = process.env.CONVERTER_API_KEY;

/**
 * POST /api/conversion-callback
 *
 * converter サービスから変換完了/失敗時に呼ばれるコールバックAPI。
 * model_assets テーブルの conversion_status を更新する。
 *
 * 認証: X-Converter-Api-Key ヘッダーで共有シークレットを検証。
 */
export async function POST(request: NextRequest) {
  // API キー認証
  if (CONVERTER_API_KEY) {
    const providedKey = request.headers.get("X-Converter-Api-Key");
    if (providedKey !== CONVERTER_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json();
  const { assetId, status, glbPath, glbSizeBytes, error } = body;

  if (!assetId || !status) {
    return NextResponse.json(
      { error: "assetId と status は必須です。" },
      { status: 400 },
    );
  }

  if (status !== "completed" && status !== "failed") {
    return NextResponse.json(
      { error: "status は 'completed' または 'failed' である必要があります。" },
      { status: 400 },
    );
  }

  // service_role キーで DB を更新（RLS バイパス）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase 設定が不足しています。" },
      { status: 500 },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const updateData: Record<string, unknown> = {
    conversion_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === "completed") {
    if (glbPath) updateData.glb_path = glbPath;
    if (glbSizeBytes) updateData.glb_size_bytes = glbSizeBytes;
    updateData.conversion_error = null;
  } else {
    updateData.conversion_error = error || "不明なエラー";
  }

  const { error: dbError } = await supabaseAdmin
    .from("model_assets")
    .update(updateData)
    .eq("id", assetId);

  if (dbError) {
    console.error("[conversion-callback] DB更新失敗:", dbError.message);
    return NextResponse.json(
      { error: `DB更新失敗: ${dbError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
