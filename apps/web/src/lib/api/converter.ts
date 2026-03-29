const CONVERTER_SERVICE_URL = process.env.CONVERTER_SERVICE_URL;
const CONVERTER_API_KEY = process.env.CONVERTER_API_KEY;

interface TriggerConversionParams {
  assetId: string;
  projectId: string;
  ifcPath: string;
}

/**
 * converter サービスに IFC → GLB 変換リクエストを送信する。
 * fire-and-forget: converter は非同期で変換を実行し、完了時に callback API を呼ぶ。
 *
 * サーバーサイド（Server Actions）からのみ呼び出すこと。
 */
export async function triggerConversion(params: TriggerConversionParams): Promise<void> {
  if (!CONVERTER_SERVICE_URL) {
    console.warn("[triggerConversion] CONVERTER_SERVICE_URL が未設定です。変換をスキップします。");
    return;
  }

  const callbackUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? undefined // callback は converter が直接 DB を更新するため不要（現在の実装）
    : undefined;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (CONVERTER_API_KEY) {
    headers["X-Converter-Api-Key"] = CONVERTER_API_KEY;
  }

  const response = await fetch(`${CONVERTER_SERVICE_URL}/convert`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      assetId: params.assetId,
      projectId: params.projectId,
      ifcPath: params.ifcPath,
      callbackUrl,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`converter API エラー (${response.status}): ${body}`);
  }
}
