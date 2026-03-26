-- ============================================================
-- Storage: models バケットの RLS ポリシー
-- ============================================================
-- 実行場所: Supabase ダッシュボード > SQL Editor
-- 前提:
--   1. Storage > New bucket で「models」を作成済み（Public: OFF）
--   2. projects テーブルに owner_user_id が存在すること
-- ============================================================
-- Storage パス規約: {projectId}/{filename}.glb
--   第1セグメント = project UUID → RLS で所有者判定に使用
-- ============================================================

-- プロジェクトオーナーがモデルをアップロードできる
create policy "Owner can upload models"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'models'
    and exists (
      select 1 from projects
      where projects.id = (storage.foldername(name))[1]::uuid
        and projects.owner_user_id = auth.uid()
    )
  );

-- プロジェクトオーナーがモデルを読み取れる（署名付き URL 発行に必要）
create policy "Owner can read models"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'models'
    and exists (
      select 1 from projects
      where projects.id = (storage.foldername(name))[1]::uuid
        and projects.owner_user_id = auth.uid()
    )
  );

-- プロジェクトオーナーがモデルを削除できる
create policy "Owner can delete models"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'models'
    and exists (
      select 1 from projects
      where projects.id = (storage.foldername(name))[1]::uuid
        and projects.owner_user_id = auth.uid()
    )
  );
