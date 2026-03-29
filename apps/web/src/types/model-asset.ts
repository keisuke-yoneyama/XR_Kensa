/** IFC→GLB 変換ステータス */
export type ConversionStatus =
  | "pending"     // IFCアップロード済み、変換待ち
  | "converting"  // 変換中
  | "completed"   // 変換完了、GLB利用可能
  | "failed"      // 変換失敗
  | "direct";     // GLB直接アップロード（変換不要）

/** model_assets テーブルのアプリ内型 */
export type ModelAsset = {
  id: string;
  projectId: string;
  label: string;
  /** 変換後/直接アップロードのGLBパス。変換中はnull */
  glbPath: string | null;
  /** 元IFCファイルパス。GLB直接アップロードの場合はnull */
  ifcPath: string | null;
  /** アップロード元ファイル名 */
  originalFilename: string;
  /** アップロードファイルサイズ (bytes) */
  fileSizeBytes: number | null;
  /** 変換後GLBサイズ (bytes) */
  glbSizeBytes: number | null;
  /** 変換ステータス */
  conversionStatus: ConversionStatus;
  /** 変換失敗時のエラーメッセージ */
  conversionError: string | null;
  /** 表示順 */
  displayOrder: number;
};
