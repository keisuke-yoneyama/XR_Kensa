-- ============================================================
-- project_models → model_assets データ移行
-- ============================================================
-- 実行場所: Supabase ダッシュボード > SQL Editor
-- 前提: 005_model_assets.sql が実行済みであること
-- 注意: 実行前に project_models の件数を確認すること
-- ============================================================

-- 1. 移行前確認（件数チェック）
-- select count(*) from project_models;

-- 2. データ移行
insert into model_assets (
  project_id,
  label,
  glb_path,
  ifc_path,
  original_filename,
  file_size_bytes,
  glb_size_bytes,
  conversion_status,
  display_order,
  created_at
)
select
  pm.project_id,
  pm.label,
  pm.storage_path,                                    -- glb_path = 既存の storage_path
  null,                                               -- ifc_path = なし（GLB直接アップロード）
  reverse(split_part(reverse(pm.storage_path), '/', 1)),  -- original_filename = パスからファイル名を抽出
  null,                                               -- file_size_bytes = 不明
  null,                                               -- glb_size_bytes = 不明
  'direct',                                           -- conversion_status = 直接アップロード
  pm.display_order,
  pm.created_at
from project_models pm
where not exists (
  -- 二重実行防止: 同じ project_id + label + glb_path の組が既にあればスキップ
  select 1 from model_assets ma
  where ma.project_id = pm.project_id
    and ma.label = pm.label
    and ma.glb_path = pm.storage_path
);

-- 3. 移行後確認
-- select count(*) from model_assets;
-- select * from model_assets order by created_at;

-- 4. 移行確認後、project_models は残すが使用しない
--    完全に不要と確認できた段階で以下を実行:
--    drop table if exists project_models;
