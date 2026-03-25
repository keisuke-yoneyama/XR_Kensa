/**
 * project ID → GLB モデル一覧のマッピング（暫定ローカル設定）
 *
 * 現在はローカルの public/models/ を参照しています。
 * 将来の移行先:
 *   - DB の model_assets テーブルから取得する
 *   - Supabase Storage の署名付き URL に差し替える
 *
 * 使い方:
 *   1. public/models/ に GLB ファイルを配置する
 *   2. 下の MODEL_LIST に project ID と ModelEntry[] を追記する
 */

export type ModelEntry = {
  /** ビューア UI に表示するモデル名 */
  label: string;
  /** public/ 配下のパス（例: /models/xxx.glb）または Storage URL */
  path: string;
};

const MODEL_LIST: Record<string, ModelEntry[]> = {
  // 例:
  // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx": [
  //   { label: "全体モデル", path: "/models/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.glb" },
  //   { label: "1階躯体",   path: "/models/floor1.glb" },
  // ],
  "65166a2e-213b-49f1-bae2-ca02a9fb72a8": [
    {
      label: "全体モデル",
      path: "/models/65166a2e-213b-49f1-bae2-ca02a9fb72a8.glb",
    },
    {
      label: "モデル2",
      path: "/models/GearboxAssy.glb",
    },
  ],
};

/**
 * project ID に対応する ModelEntry[] を返す。
 * 未登録の場合は空配列。
 */
export function getModelList(projectId: string): ModelEntry[] {
  return MODEL_LIST[projectId] ?? [];
}
