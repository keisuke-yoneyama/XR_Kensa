# apps/web

鉄骨FAB向け検査支援システムの Web 管理画面です。
Next.js App Router + TypeScript + Tailwind CSS + Supabase で構成されています。
現在はフェーズ1で、projects / members テーブルが Supabase に接続済みです。

---

## ローカル起動手順

### 前提

- Node.js 18 以上
- Supabase プロジェクトが作成済みであること

### 手順

```bash
# 1. apps/web ディレクトリに移動
cd apps/web

# 2. 既存の node_modules を削除（zip 展開後や環境が壊れている場合）
rm -rf node_modules .next

# 3. 依存関係をインストール
npm install

# 4. 環境変数を設定（.env.local.example をコピーして編集）
cp .env.local.example .env.local
# .env.local を開いて NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定

# 5. 開発サーバーを起動
npm run dev
```

起動後、ブラウザで `http://localhost:3000` を開いてください。

---

## 環境変数

`.env.local` に以下を設定してください（`.env.local.example` を参照）。

| 変数名                          | 取得場所                                                   |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase ダッシュボード > Settings > API > Project URL     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase ダッシュボード > Settings > API > anon public key |

---

## Supabase セットアップ（初回のみ）

### 1. テーブルを作成する

Supabase ダッシュボード > **SQL Editor** を開き、以下の SQL を実行してください。

```sql
-- projects テーブル
create table if not exists projects (
  id           uuid        primary key default gen_random_uuid(),
  project_code text        not null,
  project_name text        not null,
  status       text        not null default 'active',
  version      text        not null default '1.0',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- members テーブル（projects に従属）
create table if not exists members (
  id          uuid        primary key default gen_random_uuid(),
  project_id  uuid        not null references projects(id) on delete cascade,
  member_kind text        not null,              -- 部材種別: column / beam / brace / other
  status      text        not null default 'pending', -- pending / in_progress / done
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at を自動更新するトリガー関数（共通）
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute procedure update_updated_at();

create trigger members_updated_at
  before update on members
  for each row execute procedure update_updated_at();

-- インデックス
create index if not exists idx_projects_project_code on projects(project_code);
create index if not exists idx_projects_created_at   on projects(created_at desc);
create index if not exists idx_members_project_id    on members(project_id);
```

### 2. RLS の設定

**フェーズ1では認証が未実装のため、RLS を無効化してください。**
認証を実装したタイミングで再設定が必要です。

```sql
-- フェーズ1: RLS を無効化（認証実装後に見直す）
alter table projects disable row level security;
alter table members  disable row level security;
```

### status / kind の候補値

**projects.status**

| 値          | 意味   |
| ----------- | ------ |
| `draft`     | 下書き |
| `active`    | 進行中 |
| `on_hold`   | 保留   |
| `completed` | 完了   |

**members.status**

| 値            | 意味   |
| ------------- | ------ |
| `pending`     | 未着手 |
| `in_progress` | 検査中 |
| `done`        | 完了   |

**members.member_kind**

| 値       | 意味       |
| -------- | ---------- |
| `column` | 柱         |
| `beam`   | 梁         |
| `brace`  | ブレース   |
| `other`  | その他     |

---

## 動作確認手順

| URL                               | 内容                               |
| --------------------------------- | ---------------------------------- |
| `/`                               | ホーム                             |
| `/projects`                       | 工事一覧（Supabase から取得）      |
| `/projects/new`                   | **新規工事登録フォーム**           |
| `/projects/{id}`                  | 工事詳細（部材数も DB から取得）   |
| `/projects/{id}/members`          | 部材一覧（Supabase から取得）      |
| `/projects/{id}/members/new`      | **部材追加フォーム**               |
| `/projects/{id}/inspections`      | 検査一覧（現在はモック）           |
| `/members/{id}`                   | 部材詳細（Supabase から取得）      |

### 新規工事登録の確認手順

1. `/projects` を開く
2. 右上の「新規工事登録」ボタンをクリック
3. 工事名・工事コードを入力して「登録する」
4. 一覧ページに戻り、登録した工事が表示されることを確認

### 部材追加の確認手順

1. `/projects/{id}` を開く（id は登録済み工事の UUID）
2. 「メンバー一覧」をクリック
3. 右上の「部材追加」をクリック
4. 部材種別・検査状況を選んで「追加する」
5. 一覧に戻り、追加した部材が表示されることを確認
6. 工事詳細に戻ると「部材数」が更新されていることを確認

---

## 現在の DB 接続状況

| リソース             | 状態                     |
| -------------------- | ------------------------ |
| projects テーブル    | ✅ Supabase 接続済み     |
| members テーブル     | ✅ Supabase 接続済み     |
| inspections テーブル | モックデータ（DB未接続） |

---

## モックデータの場所

`src/lib/mock-data.ts` に inspections のモックデータがあります。
DB 未接続のページはこのファイルを参照しています。

---

## 今後の予定（フェーズ1以降）

- inspections テーブルの Supabase 接続
- 認証（Supabase Auth）の実装
- RLS の本格設定
- BIM/IFC データ連携・AR/XR 連携
