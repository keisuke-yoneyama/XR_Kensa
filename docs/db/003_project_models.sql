-- ============================================================
-- project_models テーブル: プロジェクトに紐づく GLB モデル情報
-- ============================================================
-- 実行場所: Supabase ダッシュボード > SQL Editor
-- 前提: projects テーブルが作成済みであること
-- ============================================================

-- 1. テーブル作成
create table if not exists project_models (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  label         text not null,
  storage_path  text not null,       -- Storage 内のパス（例: {projectId}/model.glb）
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_project_models_project_id
  on project_models(project_id);

-- 2. RLS 有効化
alter table project_models enable row level security;

-- 3. RLS ポリシー（project の owner_user_id で制御）
create policy "Owner can read project models"
  on project_models for select
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = project_models.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "Owner can insert project models"
  on project_models for insert
  to authenticated
  with check (
    exists (
      select 1 from projects
      where projects.id = project_models.project_id
        and projects.owner_user_id = auth.uid()
    )
  );

create policy "Owner can delete project models"
  on project_models for delete
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = project_models.project_id
        and projects.owner_user_id = auth.uid()
    )
  );
