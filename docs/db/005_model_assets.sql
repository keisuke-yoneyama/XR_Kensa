-- ============================================================
-- model_assets テーブル: プロジェクトに紐づくモデルアセット情報
-- ============================================================
-- 実行場所: Supabase ダッシュボード > SQL Editor
-- 前提: projects テーブルが作成済みであること
-- 目的: project_models の後継テーブル。IFC→GLB変換管理を含む
-- ============================================================

-- 1. テーブル作成
create table if not exists model_assets (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references projects(id) on delete cascade,
  label             text not null,

  -- Storage パス（バケット: models）
  glb_path          text,              -- 変換後/直接アップロードのGLBパス（例: {projectId}/glb/{filename}.glb）
  ifc_path          text,              -- 元IFCファイルパス（例: {projectId}/ifc/{filename}.ifc）。GLB直接の場合はnull

  -- ファイル情報
  original_filename text not null,     -- アップロード元ファイル名
  file_size_bytes   bigint,            -- アップロードファイルサイズ
  glb_size_bytes    bigint,            -- 変換後GLBサイズ（変換完了時に設定）

  -- 変換管理
  conversion_status text not null default 'direct'
    check (conversion_status in ('pending', 'converting', 'completed', 'failed', 'direct')),
  conversion_error  text,              -- 失敗時のエラーメッセージ

  -- 表示順
  display_order     integer not null default 0,

  -- タイムスタンプ
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_model_assets_project_id
  on model_assets(project_id);

-- ============================================================
-- conversion_status の値:
--   'direct'     … GLB直接アップロード（変換不要）
--   'pending'    … IFCアップロード済み、変換待ち
--   'converting' … 変換中
--   'completed'  … 変換完了、GLB利用可能
--   'failed'     … 変換失敗
-- ============================================================

-- 2. RLS 有効化
alter table model_assets enable row level security;

-- 3. RLS ポリシー（project の owner_user_id で制御）
create policy "Owner can read model assets"
  on model_assets for select
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = model_assets.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "Owner can insert model assets"
  on model_assets for insert
  to authenticated
  with check (
    exists (
      select 1 from projects
      where projects.id = model_assets.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "Owner can update model assets"
  on model_assets for update
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = model_assets.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "Owner can delete model assets"
  on model_assets for delete
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = model_assets.project_id
        and projects.owner_user_id = auth.uid()
    )
  );
