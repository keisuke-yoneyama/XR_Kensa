/**
 * project ID → GLB パスのマッピング（暫定ローカル設定）
 *
 * 現在はローカルの public/models/ を参照しています。
 * 将来の移行先:
 *   - DB の glb_path カラムから取得する
 *   - Supabase Storage の公開 URL / 署名付き URL に差し替える
 *
 * 使い方:
 *   1. public/models/ に <project-id>.glb を配置する
 *   2. 下の MODEL_PATHS に { "project-uuid": "/models/project-uuid.glb" } を追記する
 */
const MODEL_PATHS: Record<string, string> = {
  "65166a2e-213b-49f1-bae2-ca02a9fb72a8":
    "/models/65166a2e-213b-49f1-bae2-ca02a9fb72a8.glb",
};
// 例: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx": "/models/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.glb",

/**
 * project ID に対応する GLB パスを返す。
 * 未登録の場合は null。
 */
export function getModelPath(projectId: string): string | null {
  return MODEL_PATHS[projectId] ?? null;
}

/** 未登録 project のフォールバック用サンプルパス */
export const FALLBACK_MODEL_PATH = "/models/sample.glb";
